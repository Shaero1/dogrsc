import { Injectable, NotFoundException } from '@nestjs/common';
import { CryptoAddress } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCryptoAddressDto } from './dto/create-crypto-address.dto';
import {
  CryptoAddressAdminDto,
  CryptoAddressPublicDto,
} from './dto/crypto-address-response.dto';
import { UpdateCryptoAddressDto } from './dto/update-crypto-address.dto';

@Injectable()
export class CryptoAddressesService {
  constructor(private readonly prisma: PrismaService) {}

  async findActivePublic(): Promise<{ items: CryptoAddressPublicDto[] }> {
    const items = await this.prisma.cryptoAddress.findMany({
      where: { isActive: true, isDisplayed: true },
      orderBy: { currencyCode: 'asc' },
    });

    return { items: items.map((item) => this.toPublic(item)) };
  }

  async findAllAdmin(): Promise<{ items: CryptoAddressAdminDto[] }> {
    const items = await this.prisma.cryptoAddress.findMany({
      orderBy: [{ currencyCode: 'asc' }, { createdAt: 'desc' }],
    });

    return { items: items.map((item) => this.toAdmin(item)) };
  }

  async create(dto: CreateCryptoAddressDto): Promise<CryptoAddressAdminDto> {
    const currencyCode = dto.currencyCode.trim().toUpperCase();
    const address = dto.address.trim();
    const label = dto.label?.trim() || null;

    const hasDisplayed = await this.prisma.cryptoAddress.findFirst({
      where: { currencyCode, isActive: true, isDisplayed: true },
    });

    let isActive: boolean;
    let isDisplayed: boolean;

    if (dto.setAsDisplayed) {
      isActive = true;
      isDisplayed = true;
      await this.clearDisplayedForCurrency(currencyCode);
    } else if (!hasDisplayed) {
      isActive = true;
      isDisplayed = true;
    } else {
      isActive = false;
      isDisplayed = false;
    }

    const item = await this.prisma.cryptoAddress.create({
      data: {
        currencyCode,
        label,
        address,
        isActive,
        isDisplayed,
      },
    });

    return this.toAdmin(item);
  }

  async update(
    id: string,
    dto: UpdateCryptoAddressDto,
  ): Promise<CryptoAddressAdminDto> {
    const existing = await this.prisma.cryptoAddress.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException('Crypto address not found');
    }

    let nextActive = dto.isActive ?? existing.isActive;
    let nextDisplayed = dto.isDisplayed ?? existing.isDisplayed;

    if (dto.isDisplayed === true) {
      nextActive = true;
      nextDisplayed = true;
      await this.clearDisplayedForCurrency(existing.currencyCode, id);
    }

    if (nextActive === false) {
      nextDisplayed = false;
    }

    const item = await this.prisma.cryptoAddress.update({
      where: { id },
      data: {
        ...(dto.address !== undefined ? { address: dto.address.trim() } : {}),
        ...(dto.label !== undefined
          ? { label: dto.label.trim() || null }
          : {}),
        isActive: nextActive,
        isDisplayed: nextDisplayed,
      },
    });

    return this.toAdmin(item);
  }

  private async clearDisplayedForCurrency(
    currencyCode: string,
    excludeId?: string,
  ): Promise<void> {
    await this.prisma.cryptoAddress.updateMany({
      where: {
        currencyCode,
        isDisplayed: true,
        ...(excludeId ? { id: { not: excludeId } } : {}),
      },
      data: { isDisplayed: false },
    });
  }

  private toPublic(item: CryptoAddress): CryptoAddressPublicDto {
    return {
      id: item.id,
      currencyCode: item.currencyCode,
      label: item.label,
      address: item.address,
    };
  }

  private toAdmin(item: CryptoAddress): CryptoAddressAdminDto {
    return {
      id: item.id,
      currencyCode: item.currencyCode,
      label: item.label,
      address: item.address,
      isActive: item.isActive,
      isDisplayed: item.isDisplayed,
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString(),
    };
  }
}
