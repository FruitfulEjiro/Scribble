import { Injectable, OnModuleInit } from '@nestjs/common';
// import { PrismaClient } from 'generated/prisma';
import { PrismaClient } from '@prisma/client';

@Injectable()
class PrismaService extends PrismaClient implements OnModuleInit {
  onModuleInit() {
    this.$connect()
      .then(() => console.log('Connected to DB'))
      .catch((e: Error) => console.log('Error connecting to DB:', e));
  }
}

export default PrismaService