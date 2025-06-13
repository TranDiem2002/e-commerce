package com.tutofox.ecommerce.Utils;

import com.tutofox.ecommerce.Entity.Rating;
import com.tutofox.ecommerce.Model.Response.ReviewProductResponse;
import org.modelmapper.ModelMapper;

public class RatingMapper {

    private ModelMapper mapper = new ModelMapper();

    public ReviewProductResponse convertToResponse(Rating rating){
        ReviewProductResponse response = new ReviewProductResponse();
        response.setRatingId(rating.getRatingId());
        response.setUserName(rating.getUserEntity().getName());
        response.setRating(rating.getRating());
        response.setContent(rating.getContent());
        return response;
    }
}
