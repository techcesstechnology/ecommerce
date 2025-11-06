import { Repository } from 'typeorm';
import { AppDataSource } from '../config/database.config';
import { DeliverySlot } from '../models/delivery-slot.entity';
import { NotFoundError, ConflictError, BadRequestError } from '../utils/errors';
import { logger } from '../services/logger.service';

export interface CreateDeliverySlotDto {
  date: Date;
  startTime: string;
  endTime: string;
  maxOrders: number;
  deliveryFee?: number;
  isActive?: boolean;
}

export interface UpdateDeliverySlotDto {
  startTime?: string;
  endTime?: string;
  maxOrders?: number;
  deliveryFee?: number;
  isActive?: boolean;
}

export class DeliverySlotService {
  private deliverySlotRepository: Repository<DeliverySlot>;

  constructor() {
    this.deliverySlotRepository = AppDataSource.getRepository(DeliverySlot);
  }

  async createSlot(data: CreateDeliverySlotDto): Promise<DeliverySlot> {
    const overlappingSlots = await this.deliverySlotRepository
      .createQueryBuilder('slot')
      .where('slot.date = :date', { date: data.date })
      .andWhere(
        '(slot.startTime < :endTime AND slot.endTime > :startTime)',
        { startTime: data.startTime, endTime: data.endTime }
      )
      .getMany();

    if (overlappingSlots.length > 0) {
      throw new ConflictError('Delivery slot overlaps with existing slot(s) on this date');
    }

    const slot = this.deliverySlotRepository.create(data);
    return await this.deliverySlotRepository.save(slot);
  }

  async getSlotById(id: string): Promise<DeliverySlot> {
    const slot = await this.deliverySlotRepository.findOne({
      where: { id },
    });

    if (!slot) {
      throw new NotFoundError('Delivery slot not found');
    }

    return slot;
  }

  async getAvailableSlots(startDate?: Date, endDate?: Date): Promise<DeliverySlot[]> {
    const query = this.deliverySlotRepository
      .createQueryBuilder('slot')
      .where('slot.isActive = :isActive', { isActive: true })
      .andWhere('slot.currentOrders < slot.maxOrders');

    if (startDate && endDate) {
      query.andWhere('slot.date BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      });
    } else if (startDate) {
      query.andWhere('slot.date >= :startDate', { startDate });
    }

    return await query.orderBy('slot.date', 'ASC').addOrderBy('slot.startTime', 'ASC').getMany();
  }

  async getAllSlots(filters?: {
    date?: Date;
    isActive?: boolean;
    startDate?: Date;
    endDate?: Date;
  }): Promise<DeliverySlot[]> {
    const query = this.deliverySlotRepository.createQueryBuilder('slot');

    if (filters?.date) {
      query.andWhere('slot.date = :date', { date: filters.date });
    }

    if (filters?.isActive !== undefined) {
      query.andWhere('slot.isActive = :isActive', { isActive: filters.isActive });
    }

    if (filters?.startDate && filters?.endDate) {
      query.andWhere('slot.date BETWEEN :startDate AND :endDate', {
        startDate: filters.startDate,
        endDate: filters.endDate,
      });
    }

    return await query.orderBy('slot.date', 'ASC').addOrderBy('slot.startTime', 'ASC').getMany();
  }

  async updateSlot(id: string, data: UpdateDeliverySlotDto): Promise<DeliverySlot> {
    const slot = await this.deliverySlotRepository.findOne({
      where: { id },
    });

    if (!slot) {
      throw new NotFoundError('Delivery slot not found');
    }

    Object.assign(slot, data);
    return await this.deliverySlotRepository.save(slot);
  }

  async deleteSlot(id: string): Promise<void> {
    const slot = await this.deliverySlotRepository.findOne({
      where: { id },
    });

    if (!slot) {
      throw new NotFoundError('Delivery slot not found');
    }

    if (slot.currentOrders > 0) {
      throw new ConflictError('Cannot delete delivery slot with existing orders');
    }

    await this.deliverySlotRepository.remove(slot);
  }

  async incrementSlotOrders(id: string): Promise<DeliverySlot> {
    const slot = await this.deliverySlotRepository.findOne({
      where: { id },
    });

    if (!slot) {
      throw new NotFoundError('Delivery slot not found');
    }

    if (!slot.isActive) {
      throw new BadRequestError('Delivery slot is not active');
    }

    if (slot.currentOrders >= slot.maxOrders) {
      throw new ConflictError('Delivery slot is full');
    }

    slot.currentOrders += 1;
    return await this.deliverySlotRepository.save(slot);
  }

  async decrementSlotOrders(id: string): Promise<DeliverySlot> {
    const slot = await this.deliverySlotRepository.findOne({
      where: { id },
    });

    if (!slot) {
      throw new NotFoundError('Delivery slot not found');
    }

    if (slot.currentOrders > 0) {
      slot.currentOrders -= 1;
      return await this.deliverySlotRepository.save(slot);
    }

    return slot;
  }
}

export const deliverySlotService = new DeliverySlotService();
