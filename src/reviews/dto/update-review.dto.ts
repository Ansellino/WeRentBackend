import { CreateReviewDto } from './create-review.dto';
import { PartialType, PickType } from "@nestjs/swagger";

export class UpdateReviewDto extends PartialType(
    PickType (CreateReviewDto, ['rating', 'comment', 'fit'] as const)
) {}