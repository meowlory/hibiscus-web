-- CreateTable
CREATE TABLE "plants" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "plants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "blooms" (
    "id" SERIAL NOT NULL,
    "url" TEXT NOT NULL,
    "pathname" VARCHAR(500) NOT NULL,
    "uploaded_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "plant_id" INTEGER,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "blooms_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "plants_created_at_idx" ON "plants"("created_at" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "blooms_pathname_key" ON "blooms"("pathname");

-- CreateIndex
CREATE INDEX "blooms_plant_id_idx" ON "blooms"("plant_id");

-- CreateIndex
CREATE INDEX "blooms_uploaded_at_idx" ON "blooms"("uploaded_at" DESC);

-- AddForeignKey
ALTER TABLE "blooms" ADD CONSTRAINT "blooms_plant_id_fkey" FOREIGN KEY ("plant_id") REFERENCES "plants"("id") ON DELETE SET NULL ON UPDATE CASCADE;
