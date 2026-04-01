/*
  # Stock Management Function

  ## Overview
  Adds a database function to safely decrement product stock during checkout.

  ## New Functions
  
  ### `decrement_stock`
  - Safely decrements product stock quantity
  - Prevents stock from going below zero
  - Used during order placement to update inventory

  ## Security
  - Function is accessible to authenticated users
  - Includes check constraint to prevent negative stock
*/

CREATE OR REPLACE FUNCTION decrement_stock(
  product_id uuid,
  quantity integer
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE products
  SET stock = GREATEST(stock - quantity, 0)
  WHERE id = product_id;
END;
$$;