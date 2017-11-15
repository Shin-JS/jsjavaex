package test_solution;
import java.util.Scanner;
/***
 * 회원가입,
 * 로그인 처리
 * id체크 id가 다르면 NoMemerException();
 * 회원가입 처리
 * password다르면 NoMatchPassword();
 * 패스워드 5회 입력 까지 성공 못하면 자동 종료 System.exit(0);
 * 둘다 맞으면 로그인성공 메세지 출력
 * 
 */
public class MemberExample {
	static Member[] members = new Member[10];
	static Scanner scanner = new Scanner(System.in);
	public static void main(String[] args) {
		boolean run = true;
		while(run) {
			try {
			System.out.println("-----------------------");
			System.out.println("1.회원가입|2.로그인|3.종료 ");
			System.out.println("-----------------------");
			System.out.print("선택>");
			int selectNo = scanner.nextInt();
			if(selectNo ==1) {
				 subscribe();
			}else if(selectNo==2) {
				login();
			}else if(selectNo==3) {
				 run=true;
			 }
			}catch(Exception e) {
				System.out.println("다시하세요");
			}
		}//while문 종료
		System.out.println("종료");
	}
	
	private static void login() {
		System.out.println("--------------로그인----------------");
		System.out.print("아이디를 입력하세요>");
		String id = scanner.next();
		Member member=null;
		int cnt=1;//오류횟수 카운트 변수
		try {
			member = findMember(id);//회원등록 여부 확인
			while(true) {
				try {
					System.out.print("비밀번호를 입력하세요>");
					String password = scanner.next();
					if(findPassword(member,password))break;//id와 패스워드가 맞으면 반복문 종료
				}catch(NoMatchPaswordException n) {
					if(cnt>=5) {
						System.out.println("5회 이상 오류로 종료합니다.");
						System.exit(0);//강제 종료
					}
					System.out.println(cnt+"회 입력 오류 다시 입력하세요");
					 cnt++;//오류 카운트
				}
			}
			System.out.println("로그인 환영합니다.");
			System.exit(0);//종료
		} catch (NoMemberException e) {
			System.out.println("id가 존재하지않습니다.\n 회원가입하시겠습니까?");
			char c = scanner.next().charAt(0);
			if(c=='y'||c=='Y')
				 subscribe();//회원가입
			else
			{
				System.out.println("종료합니다");
				System.exit(0);//종료
			}	
		}
	}
	//회원가입
	private static void subscribe() {
		System.out.print("아이디를 입력하세요>");
		String id = scanner.next();
		System.out.print("비밀번호를 입력하세요>");
		String password = scanner.next();
		System.out.print("이름을 입력하세요>");
		String name = scanner.next();
		for(int i=0;i<members.length;i++) {
			if(members[i]==null) {
				members[i] = new Member(id,password,name);
				break;
			}
		}
		System.out.println("회원가입 완료");
	}
	//회원 여부 확인
	private static Member findMember(String id) throws NoMemberException{
		Member member=null;
		for(int i=0;i<members.length;i++) {
			if(members[i]!=null) {
				if(members[i].getId().equals(id)) {
					member = members[i];
				  break;
				}
			}
		}
		if(member==null) {
			throw new NoMemberException();
		}
		return member;	
	}
	//패스워드 확인
	private static boolean findPassword(Member member,String password) throws NoMatchPaswordException{
		boolean isTrue=false;	
		if(member.getPassword().equals(password))
			isTrue=true;
		else
			throw new NoMatchPaswordException();
		return isTrue;	
	}
}