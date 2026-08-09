"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateMistakeDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const create_mistake_dto_1 = require("./create-mistake.dto");
class UpdateMistakeDto extends (0, mapped_types_1.PartialType)(create_mistake_dto_1.CreateMistakeDto) {
}
exports.UpdateMistakeDto = UpdateMistakeDto;
//# sourceMappingURL=update-mistake.dto.js.map