package test;

import java.util.Scanner;

/** [20171106 과제]
 *  로그인프로그램
 *  id입력받고 id확인
 *  password입력받고 성공하면 "로그인완료"
 *  "~~~님 반갑습니다."라는 환영메시지가 나올 수 있게
 *  id나 password가 안맞을경우 "회원가입을 하시겠습니까?" 후 회원가입을 받을 수 있게
 *  id&&password 동시 and연산 들어가야할듯............ id와 다른 password써도 로그인되는 오류
 **/
public class MemberServiceExample {
	static Member[] memberArray = new Member[100];
	static Scanner scanner = new Scanner(System.in);
	public static void main(String[] args) {
		//객체 생성
		String password = "";
		while(true) {
		System.out.println("아이디를 입력하세요: ");
		String id = scanner.next(); //id입력받기
		Member member = null;
		Member memberId = findId(id);
		Member memberPassword = findPw(id, password);
		if(memberId==null) { //동일 id가 없을때 회원가입받음, id먼저 확인 후 비밀번호 입력
			System.out.println("회원가입하세요");
			System.out.println("신규 가입할 id를 입력하세요");
			id = scanner.next();
			System.out.println("비밀번호를 입력하세요");
			password = scanner.next();
			System.out.println("이름을 입력하세요");
			String name = scanner.next();
			member = new Member(id, password, name);
			for(int i = 0; i<memberArray.length;i++) {
				if(memberArray[i]==null) {
					memberArray[i] = member;
					System.out.println("회원가입성공");
					break;
				}
			}
		}else { //동일 id가 있으면 이 후 비밀번호 입력
			System.out.println("패스워드를 입력하세요: ");
			password = scanner.next();
			if(memberPassword==null) { //비밀번호 입력 실패시
				System.out.println("정확한 비밀번호를 입력하세요");
			}else {
				memberPassword = findPw(id, password);
				System.out.println(memberPassword.getName()+"님 로그인을 환영합니다.");
			}
			
		}
		}
		/*System.out.println("패스워드를 입력하세요: ");
		password = scanner.next();
//		boolean result = findMember(id,password);
//		Member member = findMember(id,password);// id따로 password따로도 괜찮을듯.....
		if(member==null) {
			System.out.println("회원가입하세요");
			id = scanner.next();
			password = scanner.next();
			String name = scanner.next();
			member = new Member(id, password, name);
			for(int i = 0; i<memberArray.length;i++) {
				if(memberArray[i]==null) {
					memberArray[i] = member;
					System.out.println("회원가입성공");
					break;
				}
			}
		}else { //id와 password에 맞는 회원 존재시
			System.out.println(member.getName()+"님 로그인을 환영합니다.");
		}*/
	}
	private static Member findPw(String id,String password) {
		Member memberPw = null;
		for (int i = 0; i < memberArray.length;i++) {
			if(memberArray[i]!=null) {
				if(memberArray[i].getName().equals(id)&&memberArray[i].getPassword().equals(password)) {
					memberPw = memberArray[i];
				}
			}
		}
		return memberPw;
	}
	private static Member findId(String id) {
		Member memberId = null;
		for (int i = 0; i < memberArray.length;i++) {
			if(memberArray[i]!=null) {
				if(memberArray[i].getName().equals(id)) {
					memberId = memberArray[i];
				}
			}
		}
		return memberId;
	}
/*	private static Member findMember(String id, String password) {
		Member member = null;
		for (int i = 0; i < memberArray.length;i++) {
			if(memberArray[i].getName().equals(id)) {
				member = memberArray[i];
			}
			if(memberArray[i].getPassword().equals(password)) {
				member = memberArray[i];
			}
		}
		return member;
	}*/
}
