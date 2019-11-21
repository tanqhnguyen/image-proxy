import { MigrationInterface, QueryRunner } from 'typeorm';

export class init1574371622156 implements MigrationInterface {
  name = 'init1574371622156';

  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `CREATE TABLE "link" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "expiredAt" TIMESTAMP WITH TIME ZONE NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "fileId" character varying, CONSTRAINT "PK_26206fb7186da72fbb9eaa3fac9" PRIMARY KEY ("id"))`,
      undefined,
    );
    await queryRunner.query(
      `CREATE TABLE "file" ("id" character varying NOT NULL, "url" character varying NOT NULL, "mime" character varying NOT NULL, "ext" character varying NOT NULL, "size" integer NOT NULL, "content" bytea NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_36b46d232307066b3a2c9ea3a1d" PRIMARY KEY ("id"))`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "link" ADD CONSTRAINT "FK_65418d51d6edefe3adb66b5bd8e" FOREIGN KEY ("fileId") REFERENCES "file"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
      undefined,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `ALTER TABLE "link" DROP CONSTRAINT "FK_65418d51d6edefe3adb66b5bd8e"`,
      undefined,
    );
    await queryRunner.query(`DROP TABLE "file"`, undefined);
    await queryRunner.query(`DROP TABLE "link"`, undefined);
  }
}
