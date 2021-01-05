import { Injectable } from '@nestjs/common';
import { error } from 'console';
import { User } from 'src/users/entities/user.entity';
import { Like, Raw } from 'typeorm';
import { AllCategoriesOutput } from './dtos/all-categories.dto';
import { CategoryInput, CategoryOutput } from './dtos/category.dto';
import {
  CreateRestaurantInput,
  CreateRestaurantOutput,
} from './dtos/create-restaurant.dto';
import {
  DeleteRestaurantInput,
  DeleteRestaurantOutput,
} from './dtos/delete-restaurant.dto';
import {
  EditRestaurantInput,
  EditRestaurantOutput,
} from './dtos/edit-restaurant.dto';
import { RestaurantInput, RestaurantOutput } from './dtos/restaurant.dto';
import { RestaurantsOutput, RestaurantsInput } from './dtos/restaurants.dto';
import {
  SearchRestaurantInput,
  SearchRestaurantOutput,
} from './dtos/search-restaurant.dto';
import { Category } from './entities/category.entity';
import { Restaurant } from './entities/restaurant.entity';
import { CategoryRepository } from './repositories/category.repository';
import { RestaurantRepository } from './repositories/restaurant.repository';

@Injectable()
export class RestaurantService {
  constructor(
    private readonly restaurantRepo: RestaurantRepository,
    private readonly categoryRepo: CategoryRepository,
  ) {}

  async createRestaurant(
    owner: User,
    createRestaurantInput: CreateRestaurantInput,
  ): Promise<CreateRestaurantOutput> {
    try {
      const newRestaurant = this.restaurantRepo.create(createRestaurantInput);

      newRestaurant.owner = owner;
      const category = await this.categoryRepo.getOrCreate(
        createRestaurantInput.categoryName,
      );

      newRestaurant.category = category;
      await this.restaurantRepo.save(newRestaurant);
      return { ok: true };
    } catch (error) {
      return { ok: false, error };
    }
  }

  async editRestaurant(
    owner: User,
    editRestaurantInput: EditRestaurantInput,
  ): Promise<EditRestaurantOutput> {
    try {
      const checkRestaurant = await this.restaurantRepo.checkRestaurantAuth(
        editRestaurantInput.restaurantId,
        owner.id,
      );
      if (checkRestaurant) {
        return checkRestaurant;
      }
      let category: Category = null;
      if (editRestaurantInput.categoryName) {
        category = await this.categoryRepo.getOrCreate(
          editRestaurantInput.categoryName,
        );
      }

      this.restaurantRepo.save([
        {
          id: editRestaurantInput.restaurantId,
          ...editRestaurantInput,
          ...(category && { category }),
        },
      ]);

      return { ok: true };
    } catch (error) {
      return { ok: false, error: '식당을 수정하지 못했습니다' };
    }
  }

  async deleteRestaurant(
    owner: User,
    { restaurantId }: DeleteRestaurantInput,
  ): Promise<DeleteRestaurantOutput> {
    try {
      const checkRestaurant = await this.restaurantRepo.checkRestaurantAuth(
        restaurantId,
        owner.id,
      );
      if (checkRestaurant) {
        return checkRestaurant;
      }

      await this.restaurantRepo.delete(restaurantId);

      return { ok: true };
    } catch (error) {
      return { ok: false, error: '식당을 삭제하지 못했습니디' };
    }
  }

  async allCategories(): Promise<AllCategoriesOutput> {
    try {
      const categories = await this.categoryRepo.find();

      return { ok: true, categories };
    } catch (error) {
      return { ok: false, error: '카테고리들을 불러오지 못했습니다' };
    }
  }

  async countRestaurant(category: Category): Promise<number> {
    return await this.restaurantRepo.count({ category });
  }

  async findCategoryBySlug({
    slug,
    page,
  }: CategoryInput): Promise<CategoryOutput> {
    try {
      const category = await this.categoryRepo.findOne({ slug });

      if (!category) {
        return { ok: false, error: '카테고리를 찾지 못했습니다' };
      }

      const restaurants = await this.restaurantRepo.find({
        where: { category },
        take: 25,
        skip: (page - 1) * 25,
      });

      category.restaurants = restaurants;
      const totalResults = await this.countRestaurant(category);

      return { ok: true, category, totalPages: Math.ceil(totalResults / 25) };
    } catch (error) {
      return { ok: false, error: '카테고리를 불러오지 못했습니다' };
    }
  }

  async allRestaurants({ page }: RestaurantsInput): Promise<RestaurantsOutput> {
    try {
      const [results, totalResults] = await this.restaurantRepo.findAndCount({
        skip: (page - 1) * 25,
        take: 25,
      });

      return {
        ok: true,
        results,
        totalPages: Math.ceil(totalResults / 25),
        totalResults,
      };
    } catch (error) {
      return { ok: false, error: '식당들을 불러오지 못했습니다F' };
    }
  }

  async findRestaurantById({
    restaurantId,
  }: RestaurantInput): Promise<RestaurantOutput> {
    try {
      const restaurant = await this.restaurantRepo.findOne(restaurantId);

      if (!restaurant) {
        return { ok: false, error: '식당을 찾지 못했습니다' };
      }

      return { ok: true, restaurant };
    } catch (error) {
      return { ok: false, error: '식당을 찾지 못했습니다' };
    }
  }

  async searchRestaurantByName({
    query,
    page,
  }: SearchRestaurantInput): Promise<SearchRestaurantOutput> {
    try {
      const [
        restaurants,
        totalResults,
      ] = await this.restaurantRepo.findAndCount({
        where: {
          name: Raw(name => `${name} ILIKE '%${query}%'`),
        },
      });

      return {
        ok: true,
        restaurants,
        totalResults,
        totalPages: Math.ceil(totalResults / 25),
      };
    } catch {
      return { ok: false, error: '식당을 찾지 못했습니다' };
    }
  }
}
