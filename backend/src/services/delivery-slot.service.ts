import { Repository } from 'typeorm';
import { AppDataSource } from '../config/database.config';
import { DeliverySlot } from '../models/delivery-slot.entity';

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
    try {
      const existingSlot = await this.deliverySlotRepository.findOne({
        where: {
          date: data.date,
          startTime: data.startTime,
        },
      });

      if (existingSlot) {
        throw new Error('Delivery slot already exists for this date and time');
      }

      const slot = this.deliverySlotRepository.create(data);
      return await this.deliverySlotRepository.save(slot);
    } catch (error) {
      console.error('Error creating delivery slot:', error);
      throw error;
    }
  }

  async getSlotById(id: string): Promise<DeliverySlot | null> {
    try {
      return await this.deliverySlotRepository.findOne({
        where: { id },
      });
    } catch (error) {
      console.error('Error fetching delivery slot:', error);
      throw new Error('Failed to fetch delivery slot');
    }
  }

  async getAvailableSlots(startDate?: Date, endDate?: Date): Promise<DeliverySlot[]> {
    try {
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
    } catch (error) {
      console.error('Error fetching available slots:', error);
      throw new Error('Failed to fetch available slots');
    }
  }

  async getAllSlots(filters?: {
    date?: Date;
    isActive?: boolean;
    startDate?: Date;
    endDate?: Date;
  }): Promise<DeliverySlot[]> {
    try {
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
    } catch (error) {
      console.error('Error fetching delivery slots:', error);
      throw new Error('Failed to fetch delivery slots');
    }
  }

  async updateSlot(id: string, data: UpdateDeliverySlotDto): Promise<DeliverySlot> {
    try {
      const slot = await this.deliverySlotRepository.findOne({
        where: { id },
      });

      if (!slot) {
        throw new Error('Delivery slot not found');
      }

      Object.assign(slot, data);
      return await this.deliverySlotRepository.save(slot);
    } catch (error) {
      console.error('Error updating delivery slot:', error);
      throw error;
    }
  }

  async deleteSlot(id: string): Promise<void> {
    try {
      const slot = await this.deliverySlotRepository.findOne({
        where: { id },
      });

      if (!slot) {
        throw new Error('Delivery slot not found');
      }

      if (slot.currentOrders > 0) {
        throw new Error('Cannot delete delivery slot with existing orders');
      }

      await this.deliverySlotRepository.remove(slot);
    } catch (error) {
      console.error('Error deleting delivery slot:', error);
      throw error;
    }
  }

  async incrementSlotOrders(id: string): Promise<DeliverySlot> {
    try {
      const slot = await this.deliverySlotRepository.findOne({
        where: { id },
      });

      if (!slot) {
        throw new Error('Delivery slot not found');
      }

      if (!slot.isActive) {
        throw new Error('Delivery slot is not active');
      }

      if (slot.currentOrders >= slot.maxOrders) {
        throw new Error('Delivery slot is full');
      }

      slot.currentOrders += 1;
      return await this.deliverySlotRepository.save(slot);
    } catch (error) {
      console.error('Error incrementing slot orders:', error);
      throw error;
    }
  }

  async decrementSlotOrders(id: string): Promise<DeliverySlot> {
    try {
      const slot = await this.deliverySlotRepository.findOne({
        where: { id },
      });

      if (!slot) {
        throw new Error('Delivery slot not found');
      }

      if (slot.currentOrders > 0) {
        slot.currentOrders -= 1;
        return await this.deliverySlotRepository.save(slot);
      }

      return slot;
    } catch (error) {
      console.error('Error decrementing slot orders:', error);
      throw error;
    }
  }
}

export const deliverySlotService = new DeliverySlotService();
