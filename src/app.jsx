import { useState, useEffect } from 'react';
import { Leaf, User, LogOut, Plus, ShoppingCart, History, Settings, Home, Trash2, LogIn } from 'lucide-react';
import { supabase, auth, database } from './lib/supabase';

// 로그인 페이지
function LoginPage({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [userType, setUserType] = useState('buyer');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (isRegister) {
        // 회원가입
        const { data, error } = await auth.signUp(email, password, {
          name,
          user_type: userType
        });
        
        if (error) {
          alert('회원가입 실패: ' + error.message);
        } else {
          alert('회원가입이 완료되었습니다!');
          setIsRegister(false);
        }
      } else {
        // 로그인
        const { data, error } = await auth.signIn(email, password);
        
        if (error) {
          alert('로그인 실패: ' + error.message);
        } else {
          onLogin(data.user);
        }
      }
    } catch (error) {
      alert('오류가 발생했습니다: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-green-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-md p-8 w-full max-w-md">
        <div className="text-center mb-6">
          <div className="flex justify-center mb-4">
            <Leaf className="w-12 h-12 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">탄소배출권 거래소</h1>
          <p className="text-gray-600 mt-2">
            {isRegister ? '새 계정 만들기' : '로그인하여 시작하기'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="이메일"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            required
            disabled={loading}
          />
          
          <input
            type="password"
            placeholder="비밀번호"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            required
            disabled={loading}
          />

          {isRegister && (
            <>
              <input
                type="text"
                placeholder="이름"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
                disabled={loading}
              />
              
              <select
                value={userType}
                onChange={(e) => setUserType(e.target.value)}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                disabled={loading}
              >
                <option value="buyer">구매자</option>
                <option value="seller">판매자</option>
              </select>
            </>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 text-white p-3 rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400"
          >
            {loading ? '처리중...' : (isRegister ? '회원가입' : '로그인')}
          </button>
        </form>

        <div className="text-center mt-4">
          <button
            onClick={() => setIsRegister(!isRegister)}
            className="text-green-600 hover:underline"
            disabled={loading}
          >
            {isRegister ? '이미 계정이 있나요? 로그인' : '계정이 없나요? 회원가입'}
          </button>
        </div>
      </div>
    </div>
  );
}

// 네비게이션 바 (로그인 전)
function GuestNavbar({ onLoginClick }) {
  return (
    <nav className="bg-green-600 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Leaf className="w-8 h-8" />
          <h1 className="text-xl font-bold">탄소배출권 거래소</h1>
        </div>
        
        <button
          onClick={onLoginClick}
          className="flex items-center space-x-2 bg-green-700 px-4 py-2 rounded hover:bg-green-800 transition-colors"
        >
          <LogIn className="w-4 h-4" />
          <span>로그인</span>
        </button>
      </div>
    </nav>
  );
}

// 네비게이션 바 (로그인 후)
function Navbar({ user, onLogout, currentPage, setCurrentPage, profile }) {
  return (
    <nav className="bg-green-600 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <button
          onClick={() => setCurrentPage('main')}
          className="flex items-center space-x-2 hover:bg-green-700 px-3 py-2 rounded transition-colors"
        >
          <Leaf className="w-8 h-8" />
          <h1 className="text-xl font-bold">탄소배출권 거래소</h1>
        </button>
        
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setCurrentPage('main')}
            className={`px-3 py-2 rounded ${currentPage === 'main' ? 'bg-green-700' : 'hover:bg-green-700'}`}
          >
            <Home className="w-4 h-4 inline mr-1" />
            메인
          </button>
          
          {profile?.user_type === 'seller' && (
            <button
              onClick={() => setCurrentPage('register')}
              className={`px-3 py-2 rounded ${currentPage === 'register' ? 'bg-green-700' : 'hover:bg-green-700'}`}
            >
              <Plus className="w-4 h-4 inline mr-1" />
              배출권 등록
            </button>
          )}
          
          {profile?.user_type === 'seller' && (
            <button
              onClick={() => setCurrentPage('my-credits')}
              className={`px-3 py-2 rounded ${currentPage === 'my-credits' ? 'bg-green-700' : 'hover:bg-green-700'}`}
            >
              <ShoppingCart className="w-4 h-4 inline mr-1" />
              내 배출권
            </button>
          )}
          
          <button
            onClick={() => setCurrentPage('history')}
            className={`px-3 py-2 rounded ${currentPage === 'history' ? 'bg-green-700' : 'hover:bg-green-700'}`}
          >
            <History className="w-4 h-4 inline mr-1" />
            거래내역
          </button>
          
          <button
            onClick={() => setCurrentPage('mypage')}
            className={`px-3 py-2 rounded ${currentPage === 'mypage' ? 'bg-green-700' : 'hover:bg-green-700'}`}
          >
            <Settings className="w-4 h-4 inline mr-1" />
            마이페이지
          </button>
          
          <div className="flex items-center space-x-2 border-l pl-4">
            <User className="w-4 h-4" />
            <span>{profile?.name || '사용자'}</span>
            <button
              onClick={onLogout}
              className="hover:bg-green-700 p-1 rounded"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

// 메인 페이지 (배출권 목록)
function MainPage({ credits, onBuy, user, profile, refreshCredits }) {
  return (
    <div className="container mx-auto p-4">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">탄소배출권 거래소</h2>
        <p className="text-gray-600">환경을 위한 첫 걸음, 탄소배출권으로 시작하세요</p>
      </div>
      
      <div className="mb-6">
        <h3 className="text-xl font-bold mb-4">판매 중인 배출권</h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {credits?.filter(credit => credit.status === 'available').map(credit => (
            <div key={credit.id} className="bg-white rounded-lg shadow-md p-6 border">
              <div className="flex justify-between items-start mb-4">
                <h4 className="text-lg font-semibold text-gray-800">
                  {credit.credit_type} 배출권
                </h4>
                <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm">
                  판매중
                </span>
              </div>
              
              <div className="space-y-2 mb-4">
                <p className="text-gray-600">
                  <span className="font-medium">판매자:</span> {credit.profiles?.name || '익명'}
                  {credit.profiles?.company && ` (${credit.profiles.company})`}
                </p>
                <p className="text-gray-600">
                  <span className="font-medium">수량:</span> {credit.quantity?.toLocaleString()} tCO₂
                </p>
                <p className="text-gray-600">
                  <span className="font-medium">단가:</span> {credit.price?.toLocaleString()}원/tCO₂
                </p>
                <p className="text-xl font-bold text-green-600">
                  총액: {((credit.quantity || 0) * (credit.price || 0)).toLocaleString()}원
                </p>
                {credit.description && (
                  <p className="text-sm text-gray-500">
                    {credit.description}
                  </p>
                )}
              </div>
              
              {profile?.user_type === 'buyer' && user && (
                <button
                  onClick={() => onBuy(credit)}
                  className="w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 transition-colors"
                >
                  구매하기
                </button>
              )}
            </div>
          ))}
        </div>
        
        {!credits || credits.filter(credit => credit.status === 'available').length === 0 && (
          <div className="text-center py-12">
            <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">등록된 배출권이 없습니다.</p>
          </div>
        )}
      </div>
    </div>
  );
}

// 배출권 등록 페이지
function RegisterPage({ onRegister, loading }) {
  const [type, setType] = useState('KOC');
  const [quantity, setQuantity] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onRegister({
      credit_type: type,
      quantity: parseInt(quantity),
      price: parseInt(price),
      description: description.trim() || null
    });
    
    // 성공 시 폼 초기화
    setQuantity('');
    setPrice('');
    setDescription('');
  };

  return (
    <div className="container mx-auto p-4 max-w-md">
      <h2 className="text-2xl font-bold mb-6">배출권 등록</h2>
      
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            배출권 종류
          </label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            disabled={loading}
          >
            <option value="KOC">KOC (Korea Offset Credit)</option>
            <option value="KCU">KCU (Korea Credit Unit)</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            수량 (tCO₂)
          </label>
          <input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            placeholder="예: 100"
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            required
            min="1"
            disabled={loading}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            단가 (원/tCO₂)
          </label>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="예: 15000"
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            required
            min="1"
            disabled={loading}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            설명 (선택사항)
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="배출권에 대한 추가 정보를 입력하세요"
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent h-20 resize-none"
            disabled={loading}
          />
        </div>
        
        {quantity && price && (
          <div className="bg-green-50 p-3 rounded-lg">
            <p className="text-green-800">
              <span className="font-medium">예상 총액:</span> {(parseInt(quantity || 0) * parseInt(price || 0)).toLocaleString()}원
            </p>
          </div>
        )}
        
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400"
        >
          {loading ? '등록 중...' : '배출권 등록'}
        </button>
      </form>
    </div>
  );
}

// 내 배출권 관리 페이지 (판매자용)
function MyCreditsPage({ credits, onDelete, loading }) {
  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-6">내 배출권 관리</h2>
      
      <div className="space-y-4">
        {credits?.map(credit => (
          <div key={credit.id} className="bg-white rounded-lg shadow-md p-6 border">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  {credit.credit_type} 배출권
                </h3>
                <div className="space-y-1 text-gray-600">
                  <p>수량: {credit.quantity?.toLocaleString()} tCO₂</p>
                  <p>단가: {credit.price?.toLocaleString()}원/tCO₂</p>
                  <p className="text-lg font-bold text-green-600">
                    총액: {((credit.quantity || 0) * (credit.price || 0)).toLocaleString()}원
                  </p>
                  {credit.description && (
                    <p className="text-sm">{credit.description}</p>
                  )}
                  <p className="text-sm text-gray-500">
                    등록일: {new Date(credit.created_at).toLocaleDateString('ko-KR')}
                  </p>
                </div>
              </div>
              <div className="flex flex-col space-y-2">
                <span className={`px-3 py-1 rounded-full text-sm text-center ${
                  credit.status === 'available' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {credit.status === 'available' ? '판매중' : '판매완료'}
                </span>
                
                {credit.status === 'available' && (
                  <button
                    onClick={() => onDelete(credit.id)}
                    disabled={loading}
                    className="flex items-center justify-center space-x-1 bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 transition-colors disabled:bg-gray-400"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>삭제</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {!credits || credits.length === 0 && (
        <div className="text-center py-12">
          <Plus className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">등록된 배출권이 없습니다.</p>
        </div>
      )}
    </div>
  );
}

// 거래내역 페이지
function HistoryPage({ transactions }) {
  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-6">거래내역</h2>
      
      <div className="space-y-4">
        {transactions?.map(transaction => (
          <div key={transaction.id} className="bg-white rounded-lg shadow-md p-6 border">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  {transaction.carbon_credits?.credit_type || 'Unknown'} 배출권
                </h3>
                <div className="space-y-1 text-gray-600">
                  <p>수량: {transaction.quantity?.toLocaleString()} tCO₂</p>
                  <p>단가: {transaction.price?.toLocaleString()}원/tCO₂</p>
                  <p className="text-lg font-bold text-green-600">
                    총액: {transaction.total_amount?.toLocaleString()}원
                  </p>
                  <p className="text-sm text-gray-500">
                    거래일: {new Date(transaction.created_at).toLocaleString('ko-KR')}
                  </p>
                  <p className="text-sm text-gray-500">
                    상대방: {transaction.buyer?.name || transaction.seller?.name || '익명'}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className={`px-3 py-1 rounded-full text-sm ${
                  transaction.buyer_id ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                }`}>
                  {transaction.buyer_id ? '구매' : '판매'}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {!transactions || transactions.length === 0 && (
        <div className="text-center py-12">
          <History className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">거래내역이 없습니다.</p>
        </div>
      )}
    </div>
  );
}

// 마이페이지
function MyPage({ profile, onUpdateProfile }) {
  const [name, setName] = useState(profile?.name || '');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [company, setCompany] = useState(profile?.company || '');
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (profile) {
      setName(profile.name || '');
      setPhone(profile.phone || '');
      setCompany(profile.company || '');
    }
  }, [profile]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await onUpdateProfile({
        name: name.trim(),
        phone: phone.trim() || null,
        company: company.trim() || null
      });
      setIsEditing(false);
      alert('프로필이 업데이트되었습니다!');
    } catch (error) {
      alert('업데이트 실패: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <h2 className="text-2xl font-bold mb-6">마이페이지</h2>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold">개인정보</h3>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors"
            >
              수정하기
            </button>
          )}
        </div>

        {isEditing ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                이름
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                전화번호 (선택)
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="010-1234-5678"
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                회사명 (선택)
              </label>
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="회사명을 입력하세요"
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                disabled={loading}
              />
            </div>

            <div className="flex space-x-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 transition-colors disabled:bg-gray-400"
              >
                {loading ? '저장 중...' : '저장하기'}
              </button>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                disabled={loading}
                className="flex-1 bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600 transition-colors"
              >
                취소
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                이메일
              </label>
              <p className="p-3 bg-gray-50 rounded-lg">{profile?.email}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                이름
              </label>
              <p className="p-3 bg-gray-50 rounded-lg">{profile?.name || '설정되지 않음'}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                사용자 타입
              </label>
              <p className="p-3 bg-gray-50 rounded-lg">
                {profile?.user_type === 'seller' ? '판매자' : '구매자'}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                전화번호
              </label>
              <p className="p-3 bg-gray-50 rounded-lg">{profile?.phone || '설정되지 않음'}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                회사명
              </label>
              <p className="p-3 bg-gray-50 rounded-lg">{profile?.company || '설정되지 않음'}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                가입일
              </label>
              <p className="p-3 bg-gray-50 rounded-lg">
                {profile?.created_at ? new Date(profile.created_at).toLocaleDateString('ko-KR') : '정보 없음'}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// 메인 앱 컴포넌트
export default function App() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [currentPage, setCurrentPage] = useState('main');
  const [credits, setCredits] = useState([]);
  const [myCredits, setMyCredits] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  // 초기 인증 상태 확인
  useEffect(() => {
    auth.getCurrentUser().then(({ data }) => {
      if (data.user) {
        setUser(data.user);
      }
      setInitialLoading(false);
    });

    // 인증 상태 변경 리스너
    const { data: { subscription } } = auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setUser(session.user);
        await loadUserProfile(session.user.id);
      } else {
        setUser(null);
        setProfile(null);
      }
    });

    return () => subscription?.unsubscribe();
  }, []);

  // 사용자 프로필 로드
  const loadUserProfile = async (userId) => {
    try {
      const { data, error } = await database.getProfile(userId);
      if (error) {
        console.error('프로필 로드 실패:', error);
      } else {
        setProfile(data);
      }
    } catch (error) {
      console.error('프로필 로드 오류:', error);
    }
  };

  // 배출권 목록 새로고침
  const refreshCredits = async () => {
    setLoading(true);
    try {
      const { data, error } = await database.getCredits();
      if (error) {
        console.error('배출권 목록 로드 실패:', error);
      } else {
        setCredits(data || []);
      }
    } catch (error) {
      console.error('배출권 목록 로드 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  // 내 배출권 목록 새로고침
  const refreshMyCredits = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await database.getMyCredits(user.id);
      if (error) {
        console.error('내 배출권 목록 로드 실패:', error);
      } else {
        setMyCredits(data || []);
      }
    } catch (error) {
      console.error('내 배출권 목록 로드 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  // 거래내역 새로고침
  const refreshTransactions = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await database.getTransactions(user.id);
      if (error) {
        console.error('거래내역 로드 실패:', error);
      } else {
        setTransactions(data || []);
      }
    } catch (error) {
      console.error('거래내역 로드 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  // 사용자가 로그인했을 때 데이터 로드
  useEffect(() => {
    if (user && profile) {
      refreshCredits();
      refreshTransactions();
      if (profile.user_type === 'seller') {
        refreshMyCredits();
      }
    }
  }, [user, profile]);

  // 로그인 처리
  const handleLogin = async (userData) => {
    setUser(userData);
    await loadUserProfile(userData.id);
    setShowLogin(false);
    setCurrentPage('main');
  };

  // 로그아웃 처리
  const handleLogout = async () => {
    try {
      await auth.signOut();
      setUser(null);
      setProfile(null);
      setCurrentPage('main');
      setCredits([]);
      setMyCredits([]);
      setTransactions([]);
      setShowLogin(false);
    } catch (error) {
      console.error('로그아웃 오류:', error);
    }
  };

  // 배출권 등록
  const handleRegisterCredit = async (creditData) => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await database.createCredit({
        ...creditData,
        seller_id: user.id
      });
      
      if (error) {
        alert('배출권 등록 실패: ' + error.message);
      } else {
        alert('배출권이 등록되었습니다!');
        await refreshCredits();
        await refreshMyCredits();
      }
    } catch (error) {
      alert('등록 오류: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // 배출권 구매
  const handleBuyCredit = async (credit) => {
    if (!user || !profile) return;
    
    if (confirm(`${credit.credit_type} 배출권 ${credit.quantity}tCO₂을(를) ${((credit.quantity || 0) * (credit.price || 0)).toLocaleString()}원에 구매하시겠습니까?`)) {
      setLoading(true);
      try {
        // 거래 생성
        const transactionData = {
          credit_id: credit.id,
          buyer_id: user.id,
          seller_id: credit.seller_id,
          quantity: credit.quantity,
          price: credit.price,
          total_amount: credit.quantity * credit.price
        };

        const { data: transactionResult, error: transactionError } = await database.createTransaction(transactionData);
        
        if (transactionError) {
          alert('구매 실패: ' + transactionError.message);
          return;
        }

        // 배출권 상태를 '판매완료'로 변경
        const { error: updateError } = await supabase
          .from('carbon_credits')
          .update({ status: 'sold' })
          .eq('id', credit.id);

        if (updateError) {
          console.error('배출권 상태 업데이트 실패:', updateError);
        }

        alert('구매가 완료되었습니다!');
        await refreshCredits();
        await refreshTransactions();
        if (profile.user_type === 'seller') {
          await refreshMyCredits();
        }
      } catch (error) {
        alert('구매 오류: ' + error.message);
      } finally {
        setLoading(false);
      }
    }
  };

  // 배출권 삭제
  const handleDeleteCredit = async (creditId) => {
    if (confirm('정말로 이 배출권을 삭제하시겠습니까?')) {
      setLoading(true);
      try {
        const { error } = await database.deleteCredit(creditId);
        
        if (error) {
          alert('삭제 실패: ' + error.message);
        } else {
          alert('배출권이 삭제되었습니다.');
          await refreshCredits();
          await refreshMyCredits();
        }
      } catch (error) {
        alert('삭제 오류: ' + error.message);
      } finally {
        setLoading(false);
      }
    }
  };

  // 프로필 업데이트
  const handleUpdateProfile = async (updates) => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await database.updateProfile(user.id, updates);
      
      if (error) {
        throw new Error(error.message);
      } else {
        setProfile(data);
      }
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // 초기 로딩 중
  if (initialLoading) {
    return (
      <div className="min-h-screen bg-green-50 flex items-center justify-center">
        <div className="text-center">
          <Leaf className="w-12 h-12 text-green-600 mx-auto mb-4 animate-spin" />
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  // 로그인 페이지 표시
  if (showLogin || (user && !profile)) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {user && profile ? (
        <Navbar 
          user={user}
          profile={profile}
          onLogout={handleLogout}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
        />
      ) : (
        <GuestNavbar onLoginClick={() => setShowLogin(true)} />
      )}
      
      <main>
        {currentPage === 'main' && (
          <MainPage 
            credits={credits} 
            onBuy={handleBuyCredit} 
            user={user}
            profile={profile}
            refreshCredits={refreshCredits}
          />
        )}
        {currentPage === 'register' && profile?.user_type === 'seller' && (
          <RegisterPage 
            onRegister={handleRegisterCredit}
            loading={loading}
          />
        )}
        {currentPage === 'my-credits' && profile?.user_type === 'seller' && (
          <MyCreditsPage 
            credits={myCredits}
            onDelete={handleDeleteCredit}
            loading={loading}
          />
        )}
        {currentPage === 'history' && user && (
          <HistoryPage transactions={transactions} />
        )}
        {currentPage === 'mypage' && user && profile && (
          <MyPage 
            profile={profile}
            onUpdateProfile={handleUpdateProfile}
          />
        )}
      </main>
    </div>
  );
}