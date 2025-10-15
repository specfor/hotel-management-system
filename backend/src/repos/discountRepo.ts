 
import {DiscountPublic, DiscountCreateInput, DiscountUpdateInput} from "@src/types/discount";
import db from "@src/common/util/db";

export async function getAllDiscountsDB(): Promise<DiscountPublic[] | null>{
  try{
    const sql = `
      SELECT 
        discount_id AS "discountId",
        branch_id AS "branchId",
        discount_name AS "discountName",
        discount_type AS "discountType",
        discount_value AS "discountValue",
        min_bill_amount AS "minBillAmount",
        discount_condition AS "discountCondition",
        valid_from AS "validFrom",
        valid_to AS "validTo"
      FROM discount;
    `;

    const result = await db.query(sql);
    if (result.rowCount === 0) {
      return null;
    }

    return result.rows as DiscountPublic[];
      
  }catch(err){
    console.error(err);
    return null;
  }
}

export async function getDiscountByIdDB(discountID: number): Promise<DiscountPublic | null> {
  try {
    const sql = `
      SELECT
        discount_id AS "discountId",
        branch_id AS "branchId",
        discount_name AS "discountName",
        discount_type AS "discountType",
        discount_value AS "discountValue",
        min_bill_amount AS "minBillAmount",
        discount_condition AS "discountCondition",
        valid_from AS "validFrom",
        valid_to AS "validTo"
      FROM discount
      WHERE discount_id = $1;
    `;

    const result = await db.query(sql, [discountID]);
    if (result.rowCount === 0) return null;
    return result.rows[0] as DiscountPublic;

  } catch (err) {
    console.error("Error in getDiscountByIdDB:", err);
    return null;
  }
}

export async function getDiscountsByBranchDB(branchID: number): Promise<DiscountPublic[] | null> {
  try {
    const sql = `
      SELECT
        discount_id AS "discountId",
        branch_id AS "branchId",
        discount_name AS "discountName",
        discount_type AS "discountType",
        discount_value AS "discountValue",
        min_bill_amount AS "minBillAmount",
        discount_condition AS "discountCondition",
        valid_from AS "validFrom",
        valid_to AS "validTo"
      FROM discount
      WHERE branch_id = $1;
    `;

    const result = await db.query(sql, [branchID]);

    if (result.rowCount === 0) return null;
    return result.rows as DiscountPublic[];

  } catch (err) {
    console.error("Error in getDiscountsByBranchDB:", err);
    return null;
  }
}

export async function createDiscountDB(discount: DiscountCreateInput): Promise<DiscountPublic | null> {
  try {
    const sql = `
      INSERT INTO discount (
        branch_id,
        discount_name,
        discount_type,
        discount_value,
        min_bill_amount,
        discount_condition,
        valid_from,
        valid_to
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING
        discount_id AS "discountId",
        branch_id AS "branchId",
        discount_name AS "discountName",
        discount_type AS "discountType",
        discount_value AS "discountValue",
        min_bill_amount AS "minBillAmount",
        discount_condition AS "discountCondition",
        valid_from AS "validFrom",
        valid_to AS "validTo";
    `;

    const result = await db.query(sql, [
      discount.branchId,
      discount.discountName,
      discount.discountType,
      discount.discountValue,
      discount.minBillAmount ?? null,
      discount.discountCondition ?? null,
      discount.validFrom,
      discount.validTo,
    ]);

    return result.rows[0] as DiscountPublic;
  } catch (err) {
    console.error("Error in createDiscountDB:", err);
    return null;
  }
}

export async function updateDiscountDB(
  discountID: number,
  discount: DiscountUpdateInput,
): Promise<DiscountPublic | null> {
  try {
    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (discount.branchId !== undefined) {
      updates.push(`branch_id = $${paramIndex}`);
      values.push(discount.branchId);
      paramIndex++;
    }

    if (discount.discountName !== undefined) {
      updates.push(`discount_name = $${paramIndex}`);
      values.push(discount.discountName);
      paramIndex++;
    }

    if (discount.discountType !== undefined) {
      updates.push(`discount_type = $${paramIndex}`);
      values.push(discount.discountType);
      paramIndex++;
    }

    if (discount.discountValue !== undefined) {
      updates.push(`discount_value = $${paramIndex}`);
      values.push(discount.discountValue);
      paramIndex++;
    }

    if (discount.minBillAmount !== undefined) {
      updates.push(`min_bill_amount = $${paramIndex}`);
      values.push(discount.minBillAmount);
      paramIndex++;
    }

    if (discount.discountCondition !== undefined) {
      updates.push(`discount_condition = $${paramIndex}`);
      values.push(discount.discountCondition);
      paramIndex++;
    }

    if (discount.validFrom !== undefined) {
      updates.push(`valid_from = $${paramIndex}`);
      values.push(discount.validFrom);
      paramIndex++;
    }

    if (discount.validTo !== undefined) {
      updates.push(`valid_to = $${paramIndex}`);
      values.push(discount.validTo);
      paramIndex++;
    }

    if (updates.length === 0) {
      return null;
    }

    const sql = `
            UPDATE discount
            SET ${updates.join(", ")}
            WHERE discount_id = $${paramIndex}
                RETURNING
        discount_id AS "discountId",
        branch_id AS "branchId",
        discount_name AS "discountName",
        discount_type AS "discountType",
        discount_value AS "discountValue",
        min_bill_amount AS "minBillAmount",
        discount_condition AS "discountCondition",
        valid_from AS "validFrom",
        valid_to AS "validTo";
        `;

    values.push(discountID);

    const result = await db.query(sql, values);

    if (result.rows.length === 0) {
      return null;
    }

    return result.rows[0] as DiscountPublic;
  } catch (err) {
    console.error("Error in updateDiscountDB:", err);
    return null;
  }
}

export async function deleteDiscountDB(discountID: number): Promise<boolean> {
  try {
    const sql = `
      DELETE FROM discount
      WHERE discount_id = $1;
    `;
    const result = await db.query(sql, [discountID]);
    return result.rowCount > 0;
  } catch (err) {
    console.error("Error in deleteDiscountDB:", err);
    return false;
  }
}