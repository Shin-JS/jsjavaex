package test;

import java.util.Scanner;

/** [20171103 과제]
 * 
 **/
public class BankApp {
	private static Account[] accountArray = new Account[100];
	private static Scanner scanner = new Scanner(System.in);
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
		
	}
	private static void deposit() {

		while(true) {
		String anno;
		System.out.print("입금을 원하는 계좌의 계좌번호를 입력하세요: ");
		anno = scanner.next();
		for (int i = 0; i<accountArray.length;i++) {
			int num; 
			/*if (accountArray[i].getAno()==anno) {
				int bal;
				System.out.println("입금하실 금액을 입력하세요: ");
				bal = scanner.nextInt();
				accountArray[i].setBalance(bal);
				System.out.println("현재 잔액은: "+accountArray[i].getBalance()+"입니다.");
			}*/
		}
		}
	}
	private static void accountList() {
		for(int i = 0; i<accountArray.length;i++) {
			if(accountArray[i]!=null) {
			System.out.println("계좌번호: "+accountArray[i].getAno()+", 소유주: "+ accountArray[i].getOwner()+", 잔액: "+accountArray[i].getBalance());
			}
		}
		
	}
	private static void createAccount() {
		// Bank-0001, 홍길동, 100000
		for(int i = 0; i<accountArray.length;i++) {
			System.out.print("계좌번호를 입력하세요: ");
			String ano = scanner.next();
			System.out.println();
			System.out.print("이름을 입력하세요: ");
			String owner = scanner.next();
			System.out.println();
			System.out.print("첫입금액을 입력하세요: ");
			int balance = scanner.nextInt();
			accountArray[i] = new Account(ano, owner, balance);
			char cte;
			System.out.println("계좌를 더 생성하시겠습니까?(Y/N)");
			cte = scanner.next().charAt(0);
			if (cte=='n'||cte=='N') {
				System.out.println("계좌생성을 종료합니다.");
				return;
			}//반복을 빠져나가기 위한 if문
		}
		
	}//메소드 끝
	
}

//강사님 e-mail: vctor@naver.com
