import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateRestaurantDTO } from './dtos/create-restaurant.dto';
import { UpdateRestaurantDTO } from './dtos/update-restaurant.dto';
import { Restaurant } from './entities/restaurant.entity';

@Injectable()
export class RestaurantService {
  constructor(
    @InjectRepository(Restaurant)
    private readonly restaurantRepo: Repository<Restaurant>,
  ) {}

  getAll(): Promise<Restaurant[]> {
    return this.restaurantRepo.find();
  }

  createRestaurant(
    createRestaurantDTO: CreateRestaurantDTO,
  ): Promise<Restaurant> {
    const newRestaurant = this.restaurantRepo.create(createRestaurantDTO);

    return this.restaurantRepo.save(newRestaurant);
  }

  updateRestaurant({ id, data }: UpdateRestaurantDTO) {
    return this.restaurantRepo.update(id, { ...data });
  }
}
