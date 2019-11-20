import { MigrationInterface, QueryRunner } from 'typeorm';

export class imageTable1574114601786 implements MigrationInterface {
  name = 'imageTable1574114601786';

  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `CREATE TABLE "image" ("id" character varying NOT NULL, "url" character varying NOT NULL, "mime" character varying NOT NULL, "ext" character varying NOT NULL, "size" integer NOT NULL, "content" bytea NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_d6db1ab4ee9ad9dbe86c64e4cc3" PRIMARY KEY ("id"))`,
      undefined,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(`DROP TABLE "image"`, undefined);
  }
}
