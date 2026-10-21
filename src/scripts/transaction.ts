import cron from "node-cron";
import { prisma } from "../lib/prisma.js";

export const expiredTransactionCron = () => {
  cron.schedule("* * * * * *", async () => {
    // 1. cari dulu transaksi yang expireAt nya sudah melebihi bow dan statusnya masih WAITING_FOR_PAYMENT
    const expiredTransactions = await prisma.transaction.findMany({
      where: {
        status: "WAITING_FOR_PAYMENT",
        expiredAt: { lte: new Date() },
      },
    });

    // 2. Looping seluruh transaksi tersebut dan update status transaksi menjadi EXPIRED + balikin kursinya
    for (const transaction of expiredTransactions) {
      await prisma.$transaction(async (tx) => {
        await tx.transaction.update({
          where: { id: transaction.id },
          data: { status: "EXPIRED" },
        });

        await tx.product.update({
          where: { id: transaction.productId },
          data: { stock: { increment: transaction.qty } },
        });
      });
      console.log(
        `CRON EXECUTED -> Transaction With Id: ${transaction.id} EXPIRED`,
      );
    }
  });
};
