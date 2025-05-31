package com.tutofox.ecommerce.Model.Response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Month;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class RevenueByMonth {

    private Month month;

    private float revenue;
}
