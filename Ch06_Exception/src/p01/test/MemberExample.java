package p01.test;

import java.util.Scanner;

public class MemberExample {
	static Member[] member = new Member[10];
	static Scanner sc = new Scanner(System.in);
	public static void main(String[] args) {

		/**
		 * 회원가입, 
		 * 로그인처리
		 * id체크 후 id가 다르면 NoMemberException예외 발생
		 * passsword체크 후 password가 다르면 NoMatchPassword예외 
		 * 둘 다 맞으면 로그인 성공 메세지 출력
		 * NoMemberException발생시, 회원가입처리 
		 * NoMatchPassword발생시, 5회 입력제한, 성공 실패시 자동 종료(System.exit(0)사용)
		 **/


		while(true) {
		System.out.println("==============================");
		System.out.println("1. 회원가입||2.로그인||3.종료");
		System.out.println("==============================");
		System.out.print("선택: ");
		int select = sc.nextInt();
		if(select == 1) { //회원가입
			String id;
			String password;
			String name;
			System.out.print("아이디를 입력하세요: ");
			id = sc.next();
			System.out.println();
			System.out.print("비밀번호를 입력하세요: ");
			password = sc.next();
			System.out.println();
			System.out.print("이름을 입력하세요: ");
			name = sc.next();
			for (int i = 0; i < member.length; i++) {
				if(member[i]!=null) {
				}else {
					member[i] = new Member(id,password,name);
					break;
				}
			}
		}else if (select == 2) { //로그인
			try {
			String id;
			String password;
			String name;
			System.out.println("아이디를 입력하세요: ");
			id = sc.next();
			Member memberId = findId(id);
			System.out.println("비밀번호를 입력하세요: ");
			password = sc.next();
			Member meberPw = findPw(id, password);
			}catch (NoMemberException ne) {
				String id2;
				String password2;
				String name2;
				System.out.println(ne.getMessage());
				System.out.println("가입할 id를 입력하세요");
				id2 = sc.next();
				System.out.println();
				System.out.print("비밀번호를 입력하세요: ");
				password2 = sc.next();
				System.out.println();
				System.out.print("이름을 입력하세요: ");
				name2 = sc.next();
				for (int i = 0; i < member.length; i++) {
					if(member[i]!=null) {
					}else {
						member[i] = new Member(id2,password2,name2);
						break;
					}
				}
			}catch (NoMatchPassword pe) {
				
			}catch (Exception e) {

				e.printStackTrace();
			}
			
		}else if (select == 3) {//종료
			System.out.println("종료합니다.");
			break;
		}
		}//while종료
	}//main종료
	private static Member findId(String id) throws Exception {
			Member memberId = null;
		for (int i = 0; i < member.length; i++) {
			if(member[i]!=null) {
				if(member[i].getId().equals(id)) {
					memberId = member[i];
				}else {
					throw new NoMemberException();
				}
			}else {
				throw new NoMemberException();
			}
		}return memberId;
	}//findId종료
	private static Member findPw(String id, String password) throws Exception{
		Member memberPw = null;
		for(int i = 0; i < member.length; i++) {
				if(member[i].getId().equals(id)&&member[i].getPassword().equals(password)) {
					memberPw = member[i];
				}else {
					throw new NoMatchPassword();
				}
		}
		return memberPw;
	}//findPw종료
}//class종료
class NoMemberException extends Exception{
	@Override
	public String getMessage() {
		return "회원가입하시겠습니까?";
	}
}
class NoMatchPassword extends Exception{
	@Override
	public String getMessage() {
		return "비밀번호를 다시 입력해주세요";
	}
}
