import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CreateRestaurantDTO } from './dtos/create-restaurant.dto';
import { UpdateRestaurantDTO } from './dtos/update-restaurant.dto';
import { Restaurant } from './entities/restaurant.entity';
import { RestaurantService } from './restaurants.service';

@Resolver(of => Restaurant)
export class RestaurantsResolver {
  constructor(private readonly restaurantService: RestaurantService) {}
  @Query(returns => [Restaurant])
  restaurants(): Promise<Restaurant[]> {
    return this.restaurantService.getAll();
  }

  @Mutation(returns => Boolean)
  async createRestaurant(
    @Args('input') createRestaurantDTO: CreateRestaurantDTO,
  ): Promise<boolean> {
    console.log(createRestaurantDTO);
    try {
      await this.restaurantService.createRestaurant(createRestaurantDTO);
      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  }

  @Mutation(returns => Boolean)
  async updateRestaurant(
    @Args('input') updateRestaurantDTO: UpdateRestaurantDTO,
  ) {
    try {
      await this.restaurantService.updateRestaurant(updateRestaurantDTO);
      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  }
}
