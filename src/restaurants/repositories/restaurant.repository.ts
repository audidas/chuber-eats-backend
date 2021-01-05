import { CoreOutput } from 'src/common/dtos/output.dto';
import { EntityRepository, Repository } from 'typeorm';
import { Restaurant } from '../entities/restaurant.entity';

@EntityRepository(Restaurant)
export class RestaurantRepository extends Repository<Restaurant> {
  async checkRestaurantAuth(
    restaurantId: number,
    ownerId: number,
  ): Promise<CoreOutput> {
    try {
      const restaurant = await this.findOne(restaurantId);
      if (!restaurant) {
        return { ok: false, error: '식당이 없습니다' };
      }
      if (ownerId !== restaurant.ownerId) {
        return { ok: false, error: '식당을 수정할 권한이 없습니다' };
      }
    } catch (error) {
      return { ok: false, error };
    }
  }
}
