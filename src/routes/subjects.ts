import express from "express";
import { departments, subjects } from "../db/schema/index.ts";
import { and, eq, ilike, or } from "drizzle-orm/sql/expressions/conditions";
import { db } from "../db/index.ts";
import { sql } from "drizzle-orm/sql/sql";
import { desc, getColumns, getTableColumns } from "drizzle-orm";

const router = express.Router();

// Get all subjects with optional search, filtering, and pagination
router.get("/", async (req, res) => {
  try {
    const { search, department, page = 1, limit = 10 } = req.query;

    const currentPage = Math.max(1, +page);
    const limitPerPage = Math.max(1, +limit);

    const offset = (currentPage - 1) * limitPerPage;

    const filterConditions = [];

    // If search query is provided, add a condition to filter subjects by name or code
    if (search) {
      //   filterConditions.push(
      //     `name ILIKE '%${search}%' OR code ILIKE '%${search}%'`
      //   );
      filterConditions.push(
        or(
          ilike(subjects.name, `%${search}%`),
          ilike(subjects.code, `%${search}%`),
        ),
      );
    }

    if (department) {
      filterConditions.push(ilike(departments.name, `%${department}%`));
    }

    const whereClause =
      filterConditions.length > 0 ? and(...filterConditions) : undefined;

    const countResult = await db
      .select({ count: sql<number>`count(*)`.as("count") })
      .from(subjects)
      .leftJoin(departments, eq(subjects.departmentId, departments.id))
      .where(whereClause);

    const totalCount = countResult[0]?.count ?? 0;

    const subjectsList = await db
      .select({
        ...getColumns(subjects),
        department: { ...getColumns(departments) },
      })
      .from(subjects)
      .leftJoin(departments, eq(subjects.departmentId, departments.id))
      .where(whereClause)
      .orderBy(desc(subjects.createdAt))
      .limit(limitPerPage)
      .offset(offset);

    res.status(200).json({
      data: subjectsList,
      pagination: {
        page: currentPage,
        limit: limitPerPage,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limitPerPage),
      },
    });
  } catch (e) {
    console.error("GET /subjects error:", e);
    res.status(500).json({ error: "Failed to get subjects" });
  }
});

export default router;
