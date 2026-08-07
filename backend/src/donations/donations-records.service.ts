import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  Donation,
  DonationStatus,
  PaymentMethod,
  Prisma,
} from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDonationAdminDto } from './dto/create-donation-admin.dto';
import { CreateDonationPublicDto } from './dto/create-donation-public.dto';
import {
  DonationResponseDto,
  PaginatedDonationsResponseDto,
} from './dto/donation-response.dto';
import { DonationListQueryDto } from './dto/donation-list-query.dto';

@Injectable()
export class DonationsRecordsService {
  constructor(private readonly prisma: PrismaService) {}

  createPublic(dto: CreateDonationPublicDto): Promise<DonationResponseDto> {
    return this.createRecord({
      amount: dto.amount,
      currency: dto.currency ?? 'THB',
      donorName: dto.donorName.trim(),
      donorEmail: dto.donorEmail.trim(),
      paymentMethod: dto.paymentMethod,
      status: DonationStatus.PENDING,
    });
  }

  createAdmin(dto: CreateDonationAdminDto): Promise<DonationResponseDto> {
    const status = dto.status ?? DonationStatus.PENDING;
    if (
      status !== DonationStatus.PENDING &&
      status !== DonationStatus.CONFIRMED
    ) {
      throw new BadRequestException('Admin create status must be PENDING or CONFIRMED');
    }

    return this.createRecord({
      amount: dto.amount,
      currency: dto.currency ?? 'THB',
      donorName: dto.donorName?.trim() || null,
      donorEmail: dto.donorEmail?.trim() || null,
      paymentMethod: dto.paymentMethod ?? null,
      status,
    });
  }

  async findAllAdmin(
    query: DonationListQueryDto,
  ): Promise<PaginatedDonationsResponseDto> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;
    const where: Prisma.DonationWhereInput = {
      ...(query.status ? { status: query.status } : {}),
    };

    const [total, items] = await Promise.all([
      this.prisma.donation.count({ where }),
      this.prisma.donation.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
    ]);

    return {
      items: items.map((item) => this.toResponse(item)),
      total,
      page,
      limit,
    };
  }

  async updateStatus(
    id: string,
    status: DonationStatus,
  ): Promise<DonationResponseDto> {
    if (
      status !== DonationStatus.CONFIRMED &&
      status !== DonationStatus.FAILED
    ) {
      throw new BadRequestException('Status must be CONFIRMED or FAILED');
    }

    const existing = await this.prisma.donation.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Donation not found');
    }

    if (existing.status !== DonationStatus.PENDING) {
      throw new BadRequestException('Only PENDING donations can be moderated');
    }

    const updated = await this.prisma.donation.update({
      where: { id },
      data: { status },
    });

    return this.toResponse(updated);
  }

  private async createRecord(data: {
    amount: number;
    currency: string;
    donorName: string | null;
    donorEmail: string | null;
    paymentMethod: PaymentMethod | null;
    status: DonationStatus;
  }): Promise<DonationResponseDto> {
    const donation = await this.prisma.donation.create({
      data: {
        amount: new Prisma.Decimal(data.amount),
        currency: data.currency,
        donorName: data.donorName,
        donorEmail: data.donorEmail,
        paymentMethod: data.paymentMethod,
        status: data.status,
      },
    });

    return this.toResponse(donation);
  }

  private toResponse(donation: Donation): DonationResponseDto {
    return {
      id: donation.id,
      amount: donation.amount.toString(),
      currency: donation.currency,
      status: donation.status,
      paymentMethod: donation.paymentMethod,
      donorName: donation.donorName,
      donorEmail: donation.donorEmail,
      createdAt: donation.createdAt.toISOString(),
      updatedAt: donation.updatedAt.toISOString(),
    };
  }
}
