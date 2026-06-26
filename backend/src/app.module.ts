import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { BatchesModule } from './batches/batches.module';
import { OrdersModule } from './orders/orders.module';
import { ClientOrdersModule } from './client-orders/client-orders.module';
import { AlertsModule } from './alerts/alerts.module';
import { StatsModule } from './stats/stats.module';
import { MachinesModule } from './machines/machines.module';
import { RecoveryModule } from './recovery/recovery.module';
import { NotificationsModule } from './notifications/notifications.module';
import { LoggerMiddleware } from './common/middleware/logger.middleware';

@Module({
  imports: [
    UsersModule, 
    BatchesModule, 
    OrdersModule, 
    ClientOrdersModule, 
    AlertsModule,
    StatsModule,
    MachinesModule,
    RecoveryModule,
    NotificationsModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggerMiddleware)
      .forRoutes('*');
  }
}
