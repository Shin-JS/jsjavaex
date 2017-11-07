package test_solution;

import java.util.Scanner;

public class MemberServiceExample {
	static Member[] memberArray = new Member[100];
	static Scanner scanner = new Scanner(System.in);
	static boolean isContinue = true;
	public static void main(String[] args) {
	while(isContinue) {
		//객체 생성
		System.out.println("로그인 메뉴");
		System.out.println("------------------------");
		System.out.println("|1.로그인|2.회원가입|3.종료|");
		System.out.println("------------------------");
		System.out.print("메뉴를 선택하세요>");
		int selectedNo = scanner.nextInt();
		switch(selectedNo) {
		case 1: login();   break;
		case 2: subscribe(); break;
		case 3: isContinue=false ;break;	
		}
	 }//while문 끝.	
	}
	//회원 리스트 출력
	/*private static void memberList() {
	 for(int i=0;i<memberArray.length;i++)
		 if(memberArray[i]!=null) {
			 System.out.println(memberArray[i].getId()+":"+memberArray[i].getName());
		 }		
	}*///memberList()메소드 끝.
    //회원가입
	private static void subscribe() {
		System.out.print("id를 입력하세요>");
	    String id = scanner.next();
	    System.out.print("패스워드를 입력하세요>");
	    String password = scanner.next();
	    System.out.print("이름을 입력하세요>");
	    String name = scanner.next();
	    for(int i=0;i<memberArray.length;i++) {
	    	if(memberArray[i]==null) { //객체타입 배열의 요소들의 초기값은 모두 null
	    		memberArray[i]=new Member(id,password,name);
	    		System.out.println(memberArray[i].getName()+"님 회원가입성공");
	    		break;
	    	}
	    }
	}//subscribe() 메소드 끝.
	//로그인 
	private static void login() {
		System.out.println("아이디를 입력하세요>");
		String id = scanner.next();//id
		System.out.println("패스워드를 입력하세요>");
		String password = scanner.next();//패스워드
		try {
		Member member = findMember(id,password);
		if(member==null) {
			System.out.println("가입하지않은 회원입니다.");
			System.out.println("회원가입하시겠습니까?");
			char yesNo = scanner.next().charAt(0);
			if(yesNo=='y'||yesNo=='Y') 
				subscribe();
			else {
				System.out.println("종료합니다.");
			    System.exit(0);//p/g종료
			  } 
		}else {//id와 password에 맞는 회원 존재
			System.out.println(member.getName()+"님 로그인 환영합니다.");
			System.exit(0);//p/g종료
		 }
		}catch(Exception e) {System.out.println(e.getMessage());}
	}//login()메소드 끝.
	
	private static Member findMember(String id, String password){
		Member member =null; //초기값 null
		for(Member m:memberArray) { //for-each문
			if(m!=null) {  //배열의 요소중 null이 아닌것만 연산
				if(m.getId().equals(id) && m.getPassword().equals(password))
					member = m; //배열요소중 조건에 맞는 객체를 member에 대입
				    break;  //반복문을 빠져나감
			}
	      }
		return member; //입력값에 맞는 객체가 있으면 객체, 없으면 null값이 반환
	}
}
