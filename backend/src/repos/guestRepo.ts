import db from "@src/common/util/db";
import { GuestPublic, GuestRepo } from "@src/types/guestTypes";

export async function getAllGuests_repo(): Promise<GuestPublic[]> {
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

export async function getGuestByID_repo(id: number): Promise<GuestPublic | null> {
  if (!db.isReady()) {
    await db.connect();
  }

  const result = await db.query(
    `SELECT guest_id, NIC, name, age, contact_no, email FROM guest WHERE guest_id = $1`, [id]
  );
  console.log(result)
  if (result.rows.length === 0) {
    return null;
  }

  const row = result.rows[0];
  return {
    guestId: row.guest_id,
    nic: row.nic ?? null,
    name: row.name ?? null,
    age: row.age ?? null,
    contactNo: row.contact_no ?? null,
    email: row.email ?? null,
  };
}

export async function addNewGuest_repo(record: GuestRepo): Promise<GuestPublic | null> {
  console.log(record)
  if (!db.isReady()) {
    await db.connect();
  }

  const result = await db.query(
    `insert into guest (NIC, name, age, contact_no, email, password) values
      ($1, $2, $3, $4, $5, $6)`, [record.nic, record.name, record.age, record.contactNo, record.email, record.password]
  );

  return await getGuestByID_repo(record.guestId)   // here there is bug: eventhough the new user inserted to the table correctly, reutrns "Guest not found"
}



