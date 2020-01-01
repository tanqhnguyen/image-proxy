import {MigrationInterface, QueryRunner} from "typeorm";

export class init1577883134835 implements MigrationInterface {
    name = 'init1577883134835'

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`CREATE TABLE "file" ("id" character varying NOT NULL, "url" character varying NOT NULL, "mime" character varying NOT NULL, "ext" character varying NOT NULL, "size" integer NOT NULL, "content" bytea NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_36b46d232307066b3a2c9ea3a1d" PRIMARY KEY ("id"))`, undefined);
        await queryRunner.query(`CREATE TABLE "access_token" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "expiredAt" TIMESTAMP WITH TIME ZONE NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "fileId" character varying, CONSTRAINT "PK_f20f028607b2603deabd8182d12" PRIMARY KEY ("id"))`, undefined);
        await queryRunner.query(`ALTER TABLE "access_token" ADD CONSTRAINT "FK_d298c1ba03d0bc03689c4fdc78f" FOREIGN KEY ("fileId") REFERENCES "file"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "access_token" DROP CONSTRAINT "FK_d298c1ba03d0bc03689c4fdc78f"`, undefined);
        await queryRunner.query(`DROP TABLE "access_token"`, undefined);
        await queryRunner.query(`DROP TABLE "file"`, undefined);
    }

}
