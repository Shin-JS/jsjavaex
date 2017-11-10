package p01.test;

import java.util.Scanner;

public class MemberExample {
	static Member[] member = new Member[10];
	static Scanner sc = new Scanner(System.in);
	static int j;
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
		String id;
		String password;
		String name;

		while(true) {
		System.out.println("==============================");
		System.out.println("1. 회원가입||2.로그인||3.종료");
		System.out.println("==============================");
		System.out.print("선택: ");
		int select = sc.nextInt();
		if(select == 1) { //회원가입
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

			System.out.println("아이디를 입력하세요: ");
			id = sc.next();
			Member memberId = findId(id);
			System.out.println("비밀번호를 입력하세요: ");
			password = sc.next();
			Member meberPw = findPw(password);
			System.out.println("로그인완료");
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
				System.out.println(pe.getMessage());
				System.out.println("비밀번호 5회 잘못입력할 시 프로그램이 종료됩니다.");
					for (int i = 0; i < 4; i++) {
						System.out.println("비밀번호 "+ (i+1) + "회 잘못입력하였습니다.");
						System.out.println("비밀번호를 다시 입력해주세요");
						password = sc.next();
						Member memberPw = findPw2(password);
						if(memberPw!=null) {
							System.out.println("로그인 성공");
							break;
						}else if(i==3) {
							System.out.println("비밀번호를 5회 잘못 입력하였습니다.");
							System.out.println("종료합니다.");
							System.exit(0);
							}
				}
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
					j=i;
					break;
				}
			}else {
					throw new NoMemberException();
				}
		}return memberId;
	}//findId종료
	private static Member findPw(String password) throws Exception{
		Member memberPw = null;
			if(member[j].getPassword().equals(password)) {
					memberPw = member[j];
				}else {
					throw new NoMatchPassword();
				}
		return memberPw;
	}//findPw종료
	private static Member findPw2(String password) {
		Member memberPw = null;
		if(member[j].getPassword().equals(password)) {
			memberPw = member[j];
			}
		return memberPw;
	}//findPw2종료
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
