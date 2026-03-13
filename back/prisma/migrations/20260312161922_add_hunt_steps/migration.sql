-- DropForeignKey
ALTER TABLE "Step" DROP CONSTRAINT "Step_huntId_fkey";

-- AddForeignKey
ALTER TABLE "Step" ADD CONSTRAINT "Step_huntId_fkey" FOREIGN KEY ("huntId") REFERENCES "Hunt"("id") ON DELETE CASCADE ON UPDATE CASCADE;
