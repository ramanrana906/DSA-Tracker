"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MistakesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let MistakesService = class MistakesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(data) {
        return this.prisma.mistakeEntry.create({
            data: {
                ...data,
                userId: 1,
            },
        });
    }
    async findAll(params) {
        const where = { userId: 1 };
        if (params.category)
            where.category = params.category;
        if (params.problemId)
            where.problemId = Number(params.problemId);
        return this.prisma.mistakeEntry.findMany({
            where,
            orderBy: { date: 'desc' },
            include: { problem: { select: { title: true } } }
        });
    }
    async findOne(id) {
        const mistake = await this.prisma.mistakeEntry.findUnique({
            where: { id, userId: 1 },
            include: { problem: { select: { title: true } } }
        });
        if (!mistake)
            throw new common_1.NotFoundException('Mistake not found');
        return mistake;
    }
    async remove(id) {
        return this.prisma.mistakeEntry.delete({
            where: { id, userId: 1 },
        });
    }
};
exports.MistakesService = MistakesService;
exports.MistakesService = MistakesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], MistakesService);
//# sourceMappingURL=mistakes.service.js.map