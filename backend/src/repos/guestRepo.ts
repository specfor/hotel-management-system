import db from "@src/common/util/db";
import { GuestPublic } from "@src/types/guestTypes";

export async function getAllGuests(): Promise<GuestPublic[]> {
  if (!db.isReady()) {
    await db.connect();
  }

  const result = await db.query(
    `SELECT guest_id, NIC, name, age, contact_no, email FROM guest ORDER BY guest_id ASC`
  );

  return result.rows.map((row: any) => ({
    guestId: row.guest_id,
    nic: row.nic ?? null,
    name: row.name ?? null,
    age: row.age ?? null,
    contactNo: row.contact_no ?? null,
    email: row.email ?? null,
  }));
}


