import { MigrationInterface, QueryRunner } from 'typeorm';

export class addLinkTable1574292752857 implements MigrationInterface {
  name = 'addLinkTable1574292752857';

  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `CREATE TABLE "link" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "expiredAt" TIMESTAMP WITH TIME ZONE NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "imageId" character varying, CONSTRAINT "PK_26206fb7186da72fbb9eaa3fac9" PRIMARY KEY ("id"))`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "link" ADD CONSTRAINT "FK_1add2b8ab1cd5bf6f62f0ef8627" FOREIGN KEY ("imageId") REFERENCES "image"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
      undefined,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `ALTER TABLE "link" DROP CONSTRAINT "FK_1add2b8ab1cd5bf6f62f0ef8627"`,
      undefined,
    );
    await queryRunner.query(`DROP TABLE "link"`, undefined);
  }
}
