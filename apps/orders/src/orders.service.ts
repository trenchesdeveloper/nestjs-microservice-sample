import { BILLING_SERVICE } from './constants/services';
import { OrdersRepository } from './orders.repository';
import { CreateOrderRequest } from './dto/create-order-request';
import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class OrdersService {
  constructor(
    private orderRepository: OrdersRepository,
    @Inject(BILLING_SERVICE) private readonly billingClient: ClientProxy,
  ) {}

  async createOrder(request: CreateOrderRequest) {
    const session = await this.orderRepository.startTransaction();

    try {
      const order = await this.orderRepository.create(request, { session });
      await lastValueFrom(
        this.billingClient.emit('order_created', { request }),
      );

      await session.commitTransaction();

      return order;
    } catch (err) {
      await session.abortTransaction();
      throw err;
    }
  }

  async getOrders() {
    return this.orderRepository.find({});
  }
}
