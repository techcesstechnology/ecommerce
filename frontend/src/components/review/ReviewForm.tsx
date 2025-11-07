import React, { useState } from 'react';
import styled from 'styled-components';
import { Button } from '../common/Button';

const FormContainer = styled.div`
  background-color: ${({ theme }) => theme.colors.backgroundGray};
  padding: ${({ theme }) => theme.spacing.xl};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

const FormTitle = styled.h3`
  font-size: ${({ theme }) => theme.fontSizes.xl};
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const FormGroup = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const Label = styled.label`
  display: block;
  font-size: ${({ theme }) => theme.fontSizes.md};
  font-weight: ${({ theme }) => theme.fontWeights.medium};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
  color: ${({ theme }) => theme.colors.text};
`;

const RatingContainer = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.sm};
  align-items: center;
`;

const StarButton = styled.button<{ $selected: boolean }>`
  background: none;
  border: none;
  cursor: pointer;
  font-size: ${({ theme }) => theme.fontSizes.xxxl};
  color: ${({ $selected, theme }) => 
    $selected ? theme.colors.gold : theme.colors.border};
  transition: all ${({ theme }) => theme.transitions.fast};
  padding: 0;

  &:hover {
    transform: scale(1.1);
  }
`;

const Input = styled.input`
  width: 100%;
  padding: ${({ theme }) => theme.spacing.md};
  font-size: ${({ theme }) => theme.fontSizes.md};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-family: inherit;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: ${({ theme }) => theme.spacing.md};
  font-size: ${({ theme }) => theme.fontSizes.md};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-family: inherit;
  min-height: 120px;
  resize: vertical;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

const ErrorMessage = styled.p`
  color: ${({ theme }) => theme.colors.error};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  margin-top: ${({ theme }) => theme.spacing.xs};
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};
  justify-content: flex-end;
`;

interface ReviewFormProps {
  productId: string;
  onSubmit: (data: { rating: number; title: string; comment: string }) => Promise<void>;
  onCancel?: () => void;
  initialData?: {
    rating?: number;
    title?: string;
    comment?: string;
  };
  isEditing?: boolean;
}

export const ReviewForm: React.FC<ReviewFormProps> = ({
  productId,
  onSubmit,
  onCancel,
  initialData,
  isEditing = false,
}) => {
  const [rating, setRating] = useState(initialData?.rating || 0);
  const [title, setTitle] = useState(initialData?.title || '');
  const [comment, setComment] = useState(initialData?.comment || '');
  const [hoveredRating, setHoveredRating] = useState(0);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (rating === 0) {
      newErrors.rating = 'Please select a rating';
    }

    if (!title.trim()) {
      newErrors.title = 'Title is required';
    } else if (title.trim().length < 3) {
      newErrors.title = 'Title must be at least 3 characters';
    }

    if (!comment.trim()) {
      newErrors.comment = 'Review comment is required';
    } else if (comment.trim().length < 10) {
      newErrors.comment = 'Comment must be at least 10 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        rating,
        title: title.trim(),
        comment: comment.trim(),
      });
      
      if (!isEditing) {
        setRating(0);
        setTitle('');
        setComment('');
      }
    } catch (error) {
      console.error('Failed to submit review:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setRating(initialData?.rating || 0);
    setTitle(initialData?.title || '');
    setComment(initialData?.comment || '');
    setErrors({});
    onCancel?.();
  };

  return (
    <FormContainer>
      <FormTitle>{isEditing ? 'Edit Your Review' : 'Write a Review'}</FormTitle>
      <form onSubmit={handleSubmit}>
        <FormGroup>
          <Label>Rating *</Label>
          <RatingContainer>
            {[1, 2, 3, 4, 5].map((star) => (
              <StarButton
                key={star}
                type="button"
                $selected={star <= (hoveredRating || rating)}
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
                aria-label={`Rate ${star} stars`}
              >
                ★
              </StarButton>
            ))}
            {rating > 0 && (
              <span style={{ marginLeft: '8px', fontSize: '14px', color: '#666' }}>
                {rating} star{rating !== 1 ? 's' : ''}
              </span>
            )}
          </RatingContainer>
          {errors.rating && <ErrorMessage>{errors.rating}</ErrorMessage>}
        </FormGroup>

        <FormGroup>
          <Label htmlFor="review-title">Review Title *</Label>
          <Input
            id="review-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Summarize your experience"
            maxLength={100}
          />
          {errors.title && <ErrorMessage>{errors.title}</ErrorMessage>}
        </FormGroup>

        <FormGroup>
          <Label htmlFor="review-comment">Your Review *</Label>
          <TextArea
            id="review-comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Tell us what you think about this product"
            maxLength={1000}
          />
          {errors.comment && <ErrorMessage>{errors.comment}</ErrorMessage>}
          <p style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
            {comment.length}/1000 characters
          </p>
        </FormGroup>

        <ButtonGroup>
          {onCancel && (
            <Button type="button" variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
          )}
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Submitting...' : isEditing ? 'Update Review' : 'Submit Review'}
          </Button>
        </ButtonGroup>
      </form>
    </FormContainer>
  );
};
