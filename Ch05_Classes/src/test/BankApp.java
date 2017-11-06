package test;

import java.text.DecimalFormat;
import java.util.Scanner;

/** [20171103 과제]
 * 
 **/
public class BankApp {
	private static Account[] accountArray = new Account[100];
	private static Scanner scanner = new Scanner(System.in);  
	private static final String PREFIX = "BANK-"; //계좌 자동발번을 위해 생성
	private static int seq = 0; //계좌 자동발번을 위해 생성
	private static boolean isCreated = false; //계좌등록여부 확인을 위해 생성
	public static void main(String[] args) {
		boolean run = true;
		while(run) {
			System.out.println("------------------------------------------");
			System.out.println("1.계좌생성|2.계좌목록|3.입금|4.출금|5.종료");
			System.out.println("------------------------------------------");
			System.out.print("선택: ");
			int selectNo = scanner.nextInt();
			switch(selectNo) {
			case 1: createAccount(); break;
			case 2: accountList(); break;
			case 3: deposit(); break;
			case 4: withdraw(); break;
			case 5: run = false; break;
			}
		}
		System.out.println("프로그램을 종료합니다.");		
	}
	private static void withdraw() {
		//계좌번호 선택
		//출금(잔액확인 후 -값 안되도록 설정해야할듯)
		try {
			for (int i = 0; i<accountArray.length;i++) {
				String anno;
				System.out.print("출금을 원하는 계좌의 계좌번호를 입력하세요: ");
				anno = scanner.next();
				int num; 
				if (accountArray[i].getAno().equals(anno)) { //String값을 비교하기위해 equals사용,==사용시 오류
					int bal;
					System.out.println("출금하실 금액을 입력하세요: ");
					bal = scanner.nextInt();
					if ((accountArray[i].getBalance()-bal)>0) { //출금액이 계좌 잔액보다 적을때만 출금 가능하도록
						accountArray[i].setBalance(accountArray[i].getBalance()-bal);
						System.out.println("출금액은: " + bal +"입니다.");
						System.out.println("현재 잔액은: "+accountArray[i].getBalance()+"입니다.");
						return;
					}else {
						System.out.println("잔액이 부족합니다. ");
						return;
					}
				}else {
					System.out.println("정확한 계좌번호를 입력해주세요");
				}
				  /*char cte;
					System.out.println("계속 출금하시겠습니까?(Y/N)");
					cte = scanner.next().charAt(0);
					if (cte=='n'||cte=='N') {
						System.out.println("출금을 종료합니다.");
						return;

					}else {
						i=0;
					}*/
				}
		}catch(Exception e) {System.out.println("오류가 발생했습니다.");}
	}//withdraw종료
	private static void deposit() {
//		boolean run1 = true;
		try {
		String anno;
		for (int i = 0; i<accountArray.length;i++) {
			System.out.print("입금을 원하는 계좌의 계좌번호를 입력하세요: ");
			anno = scanner.next();
//			int num; 
			if (accountArray[i].getAno().equals(anno)) { //String값을 비교하기위해 equals사용,==사용시 오류
				int bal;
				System.out.println("입금하실 금액을 입력하세요: ");
				bal = scanner.nextInt();
				accountArray[i].setBalance(accountArray[i].getBalance()+bal);
				System.out.println("현재 잔액은: "+accountArray[i].getBalance()+"입니다.");
				return;
				}else {
					System.out.println("정확한 계좌번호를 입력해주세요");
				}
		
			/*char cte;
			System.out.println("계속 입금하시겠습니까?(Y/N)");
			cte = scanner.next().charAt(0);
			if (cte=='n'||cte=='N') {
				System.out.println("입금을 종료합니다.");
				return;
			}else {
				i = 0;
			}*/
		}
		}catch(Exception e) {System.out.println("오류가 발생했습니다.");}
		}//deposit종료
	private static void accountList() {
		if(isResgistered()) {//걍 메소드 안쓰고 isCreated써도 됨... 생성된 계좌가 있는지 먼저 확인 후 리스트 출력
		for(int i = 0; i<accountArray.length;i++) {
			if(accountArray[i]!=null) {
			System.out.println("계좌번호: "+accountArray[i].getAno()+", 소유주: "+ accountArray[i].getOwner()+", 잔액: "+accountArray[i].getBalance());
			}
		}
		}else {
			System.out.println("계좌생성을 해 주세요");
			return;
		}
		
	}//accountList종료
	private static void createAccount() {
		// Bank-0001, 홍길동, 100000
		try{
			for(int i = 0; i<accountArray.length;i++) {
			/*System.out.print("계좌번호를 입력하세요: ");
			String ano = scanner.next();*/
			System.out.println();
			System.out.print("이름을 입력하세요: ");
			String owner = scanner.next();
			System.out.println();
			System.out.print("첫입금액을 입력하세요: ");
			int balance = scanner.nextInt();
			String ano = PREFIX+String.format(new DecimalFormat("0000").format(++seq));//계좌번호 형태가 BANK-0000형태가 되도록 만듬
			System.out.println("계좌번호는 \"" +ano+"\"입니다.");
			for (int j = 0; j < accountArray.length;j++) {
				if (accountArray[j]==null) {  //새로만든 계좌가 기존의 계좌에 덮어쓰기 되지 않도록 만든 반복문과 if문
			accountArray[j] = new Account(ano, owner, balance);
			break;
				}
				}
			char cte;
			isCreated = true; //isCreated변수는 static이라서 최종값을 가지고 있음
			System.out.println("계좌를 더 생성하시겠습니까?(Y/N)");
			cte = scanner.next().charAt(0);
			if (cte=='n'||cte=='N') {
				System.out.println("계좌생성을 종료합니다.");
				return;
			}//반복을 빠져나가기 위한 if문
		}
	}catch(Exception e) {System.out.println("오류가 발생했습니다.");}
	}
	private static boolean isResgistered() {
		return isCreated;  //걍 메소드 안쓰고 isCreated써도 됨...
	}
	}//메소드 끝
	

//강사님 e-mail: vctor@naver.com
