import { PrismaClient } from '@prisma/client'
import type { Profile } from '@prisma/client'

const prisma = new PrismaClient()

export interface ProfileData {
  name: string
  company?: string
  email: string
  walletAddress: string
}

export async function createProfile(userId: string, data: ProfileData): Promise<Profile> {
  return prisma.profile.create({
    data: {
      userId,
      name: data.name,
      company: data.company,
      email: data.email,
      walletAddress: data.walletAddress,
    },
  })
}

export async function getProfileByUserId(userId: string): Promise<Profile | null> {
  return prisma.profile.findUnique({
    where: { userId },
  })
}

export async function getProfileByWallet(walletAddress: string): Promise<Profile | null> {
  return prisma.profile.findUnique({
    where: { walletAddress },
  })
}

export async function updateProfile(userId: string, data: Partial<ProfileData>): Promise<Profile> {
  return prisma.profile.update({
    where: { userId },
    data: {
      ...(data.name && { name: data.name }),
      ...(data.company && { company: data.company }),
      ...(data.email && { email: data.email }),
    },
  })
}

export async function deleteProfile(userId: string): Promise<Profile> {
  return prisma.profile.delete({
    where: { userId },
  })
} 