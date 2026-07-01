import pool from '../db.js';
import crypto from 'crypto';

export const createGroup = async (req, res) => {
    const { name } = req.body || {};
    if (!name || typeof name !== 'string' || !name.trim()) {
        return res.status(400).json({ message: "Group name is required" });
    }

    const conn = await pool.getConnection();
    try {
        await conn.beginTransaction();

        const groupId = crypto.randomUUID();
        let joinCode;
        let inserted = false;

        // Collision-retry loop: join_coe is UNIQUE, so on the rare chance
        // of a collision we just generate a new one and try again
        while (!inserted) {
            joinCode = crypto.randomBytes(4).toString('hex').toUpperCase().slice(0, 8);
            try {
                const createGroupQuery = `
                    INSERT INTO \`group\` (id, name, created_by, join_code)
                    VALUES (?, ?, ?, ?)
                `;

                await conn.query(createGroupQuery, [groupId, name.trim(), req.userId, joinCode]);
                inserted = true;
            } catch (err) {
                // duplicate join_code, generate a new one and retry
                if (err.errno === 1062) { 
                    continue;
                }
                throw err;
            }
        }

        const createGroupMemberQuery = `
            INSERT INTO group_member (group_id, user_id, role)
            VALUES (?, ?, 'leader')
        `;

        await conn.query(createGroupMemberQuery, [groupId, req.userId])
        await conn.commit();

        const responseQuery = `
            SELECT 
                id, name, created_by, join_code, created_at
            FROM 
                \`group\`
            WHERE
                id = ?
        `;

        const [rows] = await pool.query(responseQuery, [groupId])
        const group = rows[0];

        return res.status(201).json({
            group: {
                id: group.id,
                name: group.name,
                joinCode: group.join_code,
                createdBy: group.created_by,
                createdAt: group.created_at
            }
        });
    } catch (err) {
        await conn.rollback();
        console.error(err);
        return res.status(500).json({ message: "Something went wrong, please try again" });
    } finally {
        conn.release();
    }
}

export const getGroups = async (req, res) => {
    const getGroupsQuery = `
        SELECT
            g.id, g.name, gm.role
        FROM 
            group_member gm
        JOIN 
            \`group\` g 
                ON g.id = gm.group_id
        WHERE
            gm.user_id = ?
        ORDER BY g.created_at DESC
    `;

    try {
        const [rows] = await pool.query(getGroupsQuery, [req.userId]);

        return res.status(200).json({
            groups: rows.map(r => ({
                id: r.id,
                name: r.name,
                role: r.role
            }))
        })
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Something went wrong, please try again" });
    }
}