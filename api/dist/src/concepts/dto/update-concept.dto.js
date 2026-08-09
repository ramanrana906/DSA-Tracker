"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateConceptDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const create_concept_dto_1 = require("./create-concept.dto");
class UpdateConceptDto extends (0, mapped_types_1.PartialType)(create_concept_dto_1.CreateConceptDto) {
}
exports.UpdateConceptDto = UpdateConceptDto;
//# sourceMappingURL=update-concept.dto.js.map