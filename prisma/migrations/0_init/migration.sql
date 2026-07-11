-- CreateTable
CREATE TABLE "students" (
    "id" SERIAL NOT NULL,
    "student_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "birth_date" TEXT,
    "gender" TEXT,
    "phone" TEXT,
    "parent_zalo" TEXT,
    "address" TEXT,
    "class_name" TEXT,
    "register_date" TEXT,
    "note" TEXT,
    "status" TEXT NOT NULL DEFAULT 'Đang học',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "students_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "classes" (
    "id" SERIAL NOT NULL,
    "class_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "level" TEXT,
    "teacher" TEXT,
    "max_students" INTEGER NOT NULL DEFAULT 25,
    "fee_per_session" INTEGER NOT NULL DEFAULT 150000,
    "note" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "classes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "schedules" (
    "id" SERIAL NOT NULL,
    "schedule_id" TEXT NOT NULL,
    "class_name" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "day_of_week" TEXT,
    "start_time" TEXT,
    "end_time" TEXT,
    "room" TEXT,
    "teacher" TEXT,
    "status" TEXT NOT NULL DEFAULT 'Đã lên lịch',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "schedules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "attendance" (
    "id" SERIAL NOT NULL,
    "attendance_id" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "class_name" TEXT,
    "date" TEXT NOT NULL,
    "day_of_week" TEXT,
    "status" TEXT,
    "note" TEXT,
    "checked_at" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "attendance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "evaluations" (
    "id" SERIAL NOT NULL,
    "evaluation_id" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "student_name" TEXT,
    "class_name" TEXT,
    "month" TEXT,
    "note" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "evaluations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "prospects" (
    "id" SERIAL NOT NULL,
    "prospect_id" TEXT NOT NULL,
    "contact_date" TEXT,
    "parent_zalo" TEXT,
    "phone" TEXT,
    "student_name" TEXT,
    "gender" TEXT,
    "grade_age" TEXT,
    "desired_time" TEXT,
    "test_status" TEXT,
    "suggested_class" TEXT,
    "note" TEXT,
    "status" TEXT NOT NULL DEFAULT 'Đang chờ',
    "linked_student_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "prospects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bills" (
    "id" SERIAL NOT NULL,
    "bill_id" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "student_name" TEXT,
    "class_name" TEXT,
    "month" TEXT,
    "sessions" INTEGER,
    "amount" INTEGER,
    "paid" INTEGER NOT NULL DEFAULT 0,
    "pay_date" TEXT,
    "status" TEXT NOT NULL DEFAULT 'Chưa thanh toán',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "bills_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "user_id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "full_name" TEXT,
    "role" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "status" TEXT NOT NULL DEFAULT 'Active',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "settings" (
    "id" SERIAL NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex (unique constraints)
CREATE UNIQUE INDEX "students_student_id_key" ON "students"("student_id");
CREATE UNIQUE INDEX "classes_class_id_key" ON "classes"("class_id");
CREATE UNIQUE INDEX "schedules_schedule_id_key" ON "schedules"("schedule_id");
CREATE UNIQUE INDEX "attendance_attendance_id_key" ON "attendance"("attendance_id");
CREATE UNIQUE INDEX "evaluations_evaluation_id_key" ON "evaluations"("evaluation_id");
CREATE UNIQUE INDEX "prospects_prospect_id_key" ON "prospects"("prospect_id");
CREATE UNIQUE INDEX "bills_bill_id_key" ON "bills"("bill_id");
CREATE UNIQUE INDEX "users_user_id_key" ON "users"("user_id");
CREATE UNIQUE INDEX "settings_key_key" ON "settings"("key");
