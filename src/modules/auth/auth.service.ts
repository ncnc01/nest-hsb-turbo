import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

// 더미 사용자 데이터
const mockUsers = [
  {
    id: '1',
    username: 'admin',
    email: 'admin@example.com',
    password: 'admin123', // 실제로는 해시된 패스워드를 사용해야 함
    role: 'admin',
    name: 'Admin User',
  },
  {
    id: '2', 
    username: 'user',
    email: 'user@example.com',
    password: 'user123',
    role: 'user',
    name: 'Test User',
  }
];

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  async validateUser(username: string, password: string): Promise<any> {
    // 더미 사용자 검증 (실제로는 해시 비교를 해야 함)
    const user = mockUsers.find(
      u => (u.username === username || u.email === username) && u.password === password
    );

    if (user) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any) {
    const payload = { username: user.username, sub: user.id, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
      user: user,
    };
  }

  async register(userData: {
    username: string;
    email: string;
    password: string;
    role?: string;
  }) {
    // 더미 등록 (실제로는 데이터베이스에 저장)
    const newUser = {
      id: String(mockUsers.length + 1),
      ...userData,
      role: userData.role || 'user',
      name: userData.username,
    };
    
    mockUsers.push(newUser);
    const { password, ...result } = newUser;
    return result;
  }
}