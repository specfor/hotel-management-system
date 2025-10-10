import db from "@src/common/util/db";
import { GuestPublic, GuestRepo, GuestPassword } from "@src/types/guestTypes";

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
    `SELECT guest_id, nic, name, age, contact_no, email FROM guest WHERE guest_id = $1`, [id]
  );
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

export async function addNewGuest_repo(record: GuestRepo): Promise<number | null> {
  if (!db.isReady()) {
    await db.connect();
  }
  const query = `insert into guest (nic, name, age, contact_no, email, password) values
                  ($1, $2, $3, $4, $5, $6)
                  RETURNING "guest_id";`;
  
  const values = [record.nic, record.name, record.age, record.contactNo, record.email, record.password]

  const result = await db.query(query, values);
  const newGuestID = result.rows[0].guest_id
  return newGuestID;  
}

export async function updateGuestInfo_repo(record: GuestPublic): Promise<GuestPublic | null> {
  if (!db.isReady()) {
    await db.connect();
  }
  const query = `UPDATE guest
      SET
        nic = $1,
        name = $2,
        age = $3,
        contact_no = $4,
        email = $5
      WHERE guest_id = $6
      RETURNING guest_id, nic, name, age, contact_no, email;`

  const values = [record.nic, record.name, record.age, record.contactNo, record.email, record.guestId]
  const result = await db.query(query, values)

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

export async function changeGuestPassword_repo(record: GuestPassword): Promise<void> {
  if (!db.isReady()) {
    await db.connect();
  }
  const query = `UPDATE guest
      SET
        password = $1
      WHERE guest_id = $2;`
  const values = [record.password, record.guestId]
  await db.query(query, values);
}


export async function deleteGuest_repo(id: number): Promise<void> {
  if (!db.isReady()) {
    await db.connect();
  }
  const query  = 'DELETE FROM guest WHERE guest_id = $1'
  const values = [id]
  await db.query(query, values);
}










// TODO: Profile update logic
// - Update guest details (name, email, phone, etc.) EXCEPT password
// - Send entire guest object from frontend, but ignore password in the update query
// - Use a single UPDATE query to modify all allowed fields
// - For password changes, create a separate endpoint/function:
//     * Verify old password
//     * Hash and store new password
//     * Do NOT allow password update through general profile update

// | Method    | Route                  | Description                 |
// | --------- | ---------------------- | --------------------------- |
// | GET       | `/guests`              | Get all guests              | Done
// | GET       | `/guests/:id`          | Get guest by ID             | Done
// | POST      | `/guests`              | Add a new guest             | Done -bug -fixed
// | PUT/PATCH | `/guests/:id`          | Update guest info           | Done
// | PUT/PATCH | `/guests/:id/psw`      | Change password             | Done
// | DELETE    | `/guests/:id`          | Soft delete guest           | Done
// | GET       | `/guests/:id/bookings` | View guest’s bookings       |
// | GET       | `/guests/:id/services` | View guest’s service usages |
// | GET       | `/guests/:id/bills`    | View bills and dues         |
// | GET       | `/guests/:id/payments` | View payments               |
