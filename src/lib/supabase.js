// 임시로 환경변수 없이도 작동하도록 수정
const supabaseUrl = import.meta.env?.VITE_SUPABASE_URL || 'https://temp.supabase.co'
const supabaseAnonKey = import.meta.env?.VITE_SUPABASE_ANON_KEY || 'temp-key'

// 환경변수가 설정되지 않았을 때의 처리
const isSupabaseConfigured = supabaseUrl !== 'https://temp.supabase.co' && supabaseAnonKey !== 'temp-key'

let supabase = null

if (isSupabaseConfigured) {
  try {
    const { createClient } = await import('@supabase/supabase-js')
    supabase = createClient(supabaseUrl, supabaseAnonKey)
    console.log('✅ Supabase 연결 성공')
  } catch (error) {
    console.error('❌ Supabase 패키지 로드 실패:', error)
  }
} else {
  console.warn('⚠️ Supabase 환경변수가 설정되지 않았습니다. Mock 데이터를 사용합니다.')
}

// Mock 데이터 (Supabase 연결 실패 시 사용)
const mockUsers = [
  { id: '1', email: 'seller@test.com', name: '판매자', user_type: 'seller' },
  { id: '2', email: 'buyer@test.com', name: '구매자', user_type: 'buyer' }
]

const mockCredits = [
  { 
    id: '1', 
    seller_id: '1', 
    credit_type: 'KOC', 
    quantity: 100, 
    price: 15000, 
    status: 'available',
    profiles: { name: '판매자', company: 'ABC Company' },
    created_at: new Date().toISOString()
  },
  { 
    id: '2', 
    seller_id: '1', 
    credit_type: 'KCU', 
    quantity: 50, 
    price: 18000, 
    status: 'available',
    profiles: { name: '판매자', company: 'ABC Company' },
    created_at: new Date().toISOString()
  }
]

let mockTransactions = []

// 인증 관련 유틸리티 함수들
export const auth = {
  // 회원가입
  signUp: async (email, password, userData) => {
    if (!isSupabaseConfigured) {
      // Mock 회원가입
      const newUser = {
        id: Date.now().toString(),
        email,
        ...userData
      }
      mockUsers.push(newUser)
      return { 
        data: { user: newUser }, 
        error: null 
      }
    }
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: userData.name,
          user_type: userData.user_type
        }
      }
    })
    return { data, error }
  },

  // 로그인
  signIn: async (email, password) => {
    if (!isSupabaseConfigured) {
      // Mock 로그인
      const user = mockUsers.find(u => u.email === email)
      if (user) {
        return { data: { user }, error: null }
      } else {
        return { data: null, error: { message: '사용자를 찾을 수 없습니다.' } }
      }
    }
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    return { data, error }
  },

  // 로그아웃
  signOut: async () => {
    if (!isSupabaseConfigured) {
      return { error: null }
    }
    
    const { error } = await supabase.auth.signOut()
    return { error }
  },

  // 현재 사용자 정보
  getCurrentUser: async () => {
    if (!isSupabaseConfigured) {
      return { data: { user: null }, error: null }
    }
    
    return await supabase.auth.getUser()
  },

  // 인증 상태 변경 리스너
  onAuthStateChange: (callback) => {
    if (!isSupabaseConfigured) {
      // Mock 리스너 - 아무것도 하지 않음
      return { data: { subscription: { unsubscribe: () => {} } } }
    }
    
    return supabase.auth.onAuthStateChange(callback)
  }
}

// 데이터베이스 관련 함수들
export const database = {
  // 프로필 조회
  getProfile: async (userId) => {
    if (!isSupabaseConfigured) {
      const user = mockUsers.find(u => u.id === userId)
      return { data: user, error: null }
    }
    
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    return { data, error }
  },

  // 프로필 업데이트
  updateProfile: async (userId, updates) => {
    if (!isSupabaseConfigured) {
      const userIndex = mockUsers.findIndex(u => u.id === userId)
      if (userIndex !== -1) {
        mockUsers[userIndex] = { ...mockUsers[userIndex], ...updates }
        return { data: mockUsers[userIndex], error: null }
      }
      return { data: null, error: { message: '사용자를 찾을 수 없습니다.' } }
    }
    
    const { data, error } = await supabase
      .from('profiles')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', userId)
      .select()
      .single()
    return { data, error }
  },

  // 배출권 목록 조회
  getCredits: async () => {
    if (!isSupabaseConfigured) {
      return { data: mockCredits.filter(c => c.status === 'available'), error: null }
    }
    
    const { data, error } = await supabase
      .from('carbon_credits')
      .select(`
        *,
        profiles:seller_id (
          name,
          company
        )
      `)
      .eq('status', 'available')
      .order('created_at', { ascending: false })
    return { data, error }
  },

  // 배출권 등록
  createCredit: async (creditData) => {
    if (!isSupabaseConfigured) {
      const newCredit = {
        id: Date.now().toString(),
        ...creditData,
        status: 'available',
        created_at: new Date().toISOString(),
        profiles: { name: '판매자', company: null }
      }
      mockCredits.push(newCredit)
      return { data: newCredit, error: null }
    }
    
    const { data, error } = await supabase
      .from('carbon_credits')
      .insert([creditData])
      .select()
      .single()
    return { data, error }
  },

  // 배출권 삭제 (상태 변경)
  deleteCredit: async (creditId) => {
    if (!isSupabaseConfigured) {
      const creditIndex = mockCredits.findIndex(c => c.id === creditId)
      if (creditIndex !== -1) {
        mockCredits[creditIndex].status = 'deleted'
        return { data: mockCredits[creditIndex], error: null }
      }
      return { data: null, error: { message: '배출권을 찾을 수 없습니다.' } }
    }
    
    const { data, error } = await supabase
      .from('carbon_credits')
      .update({ status: 'deleted' })
      .eq('id', creditId)
      .select()
      .single()
    return { data, error }
  },

  // 거래 생성
  createTransaction: async (transactionData) => {
    if (!isSupabaseConfigured) {
      const newTransaction = {
        id: Date.now().toString(),
        ...transactionData,
        created_at: new Date().toISOString()
      }
      mockTransactions.push(newTransaction)
      return { data: newTransaction, error: null }
    }
    
    const { data, error } = await supabase
      .from('transactions')
      .insert([transactionData])
      .select()
      .single()
    return { data, error }
  },

  // 거래 내역 조회
  getTransactions: async (userId) => {
    if (!isSupabaseConfigured) {
      return { data: mockTransactions.filter(t => t.buyer_id === userId || t.seller_id === userId), error: null }
    }
    
    const { data, error } = await supabase
      .from('transactions')
      .select(`
        *,
        carbon_credits (
          credit_type,
          description
        ),
        buyer:buyer_id (
          name
        ),
        seller:seller_id (
          name
        )
      `)
      .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`)
      .order('created_at', { ascending: false })
    return { data, error }
  },

  // 내 배출권 조회 (판매자용)
  getMyCredits: async (userId) => {
    if (!isSupabaseConfigured) {
      return { 
        data: mockCredits.filter(c => c.seller_id === userId && c.status !== 'deleted'), 
        error: null 
      }
    }
    
    const { data, error } = await supabase
      .from('carbon_credits')
      .select('*')
      .eq('seller_id', userId)
      .neq('status', 'deleted')
      .order('created_at', { ascending: false })
    return { data, error }
  }
}

export { supabase }