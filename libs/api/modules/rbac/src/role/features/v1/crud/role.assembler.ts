import { Assembler, ClassTransformerAssembler } from '@owl-app/crud-core'

import { RoleEntity } from '../../../../domain/entity/role.entity'
import { RoleResponse } from '../../../dto/role.response.dto';

@Assembler(RoleResponse, RoleEntity)
export class RoleAssembler extends ClassTransformerAssembler<
  RoleResponse,
  RoleEntity
> {

}