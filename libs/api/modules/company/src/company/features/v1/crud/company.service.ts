import { Injectable } from '@nestjs/common'

import { PaginatedRequest, AssemblerAsyncCrudService, Pagination } from '@owl-app/crud-nestjs'
import { InjectQueryService, QueryService } from '@owl-app/crud-core';
import { isEmpty } from '@owl-app/utils'

import { CompanyEntity } from '../../../../domain/entity/company.entity'
import { CompanyResponse } from '../../../dto/company.response'

import { CompanyModelAssembler } from './company.assembler'
import { CreateCompanyRequest, FilterCompanyDto } from './dto'

@Injectable()
export class CompanyService extends AssemblerAsyncCrudService(
  CompanyEntity,
  CompanyResponse,
  CreateCompanyRequest
) {
  constructor(
    readonly assembler: CompanyModelAssembler,
    @InjectQueryService(CompanyEntity) readonly service: QueryService<CompanyEntity>
  ) {
    super(assembler, service);
  }

  async search(
    filters: FilterCompanyDto,
    pagination: PaginatedRequest
  ): Promise<Pagination<CompanyResponse>> {
    const availableFilters = [];

    // if (!isEmpty(filters.email)) {
    //   availableFilters.push({
    //     email: { like: '%' + filters.email + '%' },
    //   });
    // }

    // if (!isEmpty(filters.firstName)) {
    //   availableFilters.push({
    //     firstName: { like: '%' + filters.firstName + '%' },
    //   });
    // }

    // if (!isEmpty(filters.lastName)) {
    //   availableFilters.push({
    //     lastName: { like: '%' + filters.lastName + '%' },
    //   });
    // }

    const result = await this.paginated(
      {
        // or: availableFilters,
      },
      pagination
    );

    return {
        ...result,
        items: result.items,
    }
  }
}