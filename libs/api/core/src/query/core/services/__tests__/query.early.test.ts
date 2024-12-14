// Unit tests for: query

import { AbstractAssembler, AggregateQuery, AggregateResponse, Assembler, DeepPartial, Query, transformAggregateQuery, transformAggregateResponse, transformQuery } from '@owl-app/nestjs-query-core';
import { QueryOptions } from '../../interfaces/query-options';
import { AppAssemblerQueryService } from '../app-assembler-query.service';

// Mock interfaces
class MockQuery {
  // Define necessary properties and methods for the mock
}

class MockAppQueryService {
  query = jest.fn();
}

describe('AppAssemblerQueryService.query() query method', () => {
  class TestDTO {
    firstName!: string;

    lastName!: string;
  }

  class TestEntity {
    first!: string;

    last!: string;
  }

  @Assembler(TestDTO, TestEntity)
  class TestAssembler extends AbstractAssembler<TestDTO, TestEntity> {
    convertToCreateEntity(create: DeepPartial<TestDTO>): DeepPartial<TestEntity> {
      return {
        first: create.firstName,
        last: create.lastName,
      };
    }

    convertToUpdateEntity(update: DeepPartial<TestDTO>): DeepPartial<TestEntity> {
      return {
        first: update.firstName,
        last: update.lastName,
      };
    }

    convertToDTO(entity: TestEntity): TestDTO {
      return {
        firstName: entity.first,
        lastName: entity.last,
      };
    }

    convertToEntity(dto: TestDTO): TestEntity {
      return {
        first: dto.firstName,
        last: dto.lastName,
      };
    }

    convertQuery(query: Query<TestDTO>): Query<TestEntity> {
      return transformQuery(query, {
        firstName: 'first',
        lastName: 'last',
      });
    }

    convertAggregateQuery(aggregate: AggregateQuery<TestDTO>): AggregateQuery<TestEntity> {
      return transformAggregateQuery(aggregate, {
        firstName: 'first',
        lastName: 'last',
      });
    }

    convertAggregateResponse(aggregate: AggregateResponse<TestEntity>): AggregateResponse<TestDTO> {
      return transformAggregateResponse(aggregate, {
        first: 'firstName',
        last: 'lastName',
      });
    }
  }

  // const testDTO: TestDTO = { firstName: 'foo', lastName: 'bar' };
  // const testEntity: TestEntity = { first: 'foo', last: 'bar' };

  let mockAssembler: TestAssembler;
  let mockQueryService: MockAppQueryService;
  let service: AppAssemblerQueryService<any, any, any, any, any, any>;

  beforeEach(() => {
    mockAssembler = new TestAssembler();
    mockQueryService = new MockAppQueryService() as any;
    service = new AppAssemblerQueryService(mockAssembler as any, mockQueryService as any);
  });

  describe('Happy paths', () => {
    it('should convert query and return DTOs', async () => {
      // Arrange
      const query = new MockQuery() as any;
      const opts: QueryOptions = {} as any;
      const entities = [{ id: 1 }, { id: 2 }];
      const dtos = [{ id: 'a' }, { id: 'b' }];

      mockQueryService.query.mockResolvedValue(entities as any as never);
      jest.spyOn(mockAssembler, 'convertQuery').mockReturnValue(query as any);
      (mockAssembler.convertAsyncToDTOs as jest.Mock<any, any>).mockResolvedValue(dtos as any as never);

      // Act
      const result = await service.query(query, opts);

      // Assert
      expect(mockQueryService.query).toHaveBeenCalledWith(query, opts);
      expect(mockAssembler.convertAsyncToDTOs).toHaveBeenCalledWith(entities);
      expect(result).toEqual(dtos);
    });
  });

  describe('Edge cases', () => {
    it('should handle empty query result', async () => {
      // Arrange
      const query = new MockQuery() as any;
      const opts: QueryOptions = {} as any;
      const entities: any[] = [];
      const dtos: any[] = [];

      mockQueryService.query.mockResolvedValue(entities as any as never);
      jest.spyOn(mockAssembler, 'convertQuery').mockReturnValue(query as any);
      (mockAssembler.convertAsyncToDTOs as jest.Mock).mockResolvedValue(dtos as any as never);

      // Act
      const result = await service.query(query, opts);

      // Assert
      expect(result).toEqual([]);
    });

    it('should handle null query options', async () => {
      // Arrange
      const query = new MockQuery() as any;
      const entities = [{ id: 1 }];
      const dtos = [{ id: 'a' }];

      mockQueryService.query.mockResolvedValue(entities as any as never);
      jest.spyOn(mockAssembler, 'convertQuery').mockReturnValue(query as any);
      (mockAssembler.convertAsyncToDTOs as jest.Mock).mockResolvedValue(dtos as any as never);

      // Act
      const result = await service.query(query, null as any);

      // Assert
      expect(result).toEqual(dtos);
    });

    it('should throw an error if query service fails', async () => {
      // Arrange
      const query = new MockQuery() as any;
      const opts: QueryOptions = {} as any;
      const error = new Error('Query service error');

      mockQueryService.query.mockRejectedValue(error as never);
      jest.spyOn(mockAssembler, 'convertQuery').mockReturnValue(query as any);

      // Act & Assert
      await expect(service.query(query, opts)).rejects.toThrow('Query service error');
    });
  });
});

// End of unit tests for: query
