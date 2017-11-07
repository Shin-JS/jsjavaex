package test_solution;
import java.text.DecimalFormat;
import java.util.Scanner;

public class BankApp {
	private static Account[] accountArray = new Account[100];
	private static Scanner scanner = new Scanner(System.in);
	private static final String PREFIX = "Bank-";
	private static int seq=0;//계좌번호 자동발번
	private static boolean isCreated=false;//계좌등록여부 
	public static void main(String[] args) {
		boolean run =true;
		while(run) {
			System.out.println("-------------------------------------");
			System.out.println("1.계좌생성|2.계좌목록|3.예금|4.출금|5.종료");
			System.out.println("-------------------------------------");
			System.out.print("선택>");
			int selectNo = scanner.nextInt();
			switch(selectNo) {
			case 1: createAccount(); break;
			case 2: accountList(); break;
			case 3: deposit(); break;
			case 4: withdraw(); break;
			case 5: run=false; break;
			}
		}
		System.out.println("프로그램 종료");
	}
	//출금 메소드
	private static void withdraw() {
		if(!isRegistered()) {
			System.out.println("먼저 계좌등록을 하세요");
			return;//메소드 실행 종료.
		}
		//계좌번호 출력
		 accountList();
		//계좌번호 선택
		 System.out.println("출금할 계좌번호를 선택하세요>");
		//출금(잔액<출금액)
		 Account account;
		 while(true) {
			 String ano = scanner.next();//출금 계좌번호 입력
			 account = findAccount(ano);//입력받은 정보로 계좌조회
			 if(account==null)
				 System.out.println("계좌번호를 확인하세요");
			 else
				 break;//반복문 빠져나가기
		 }
		 //출금처리
		 System.out.print("출금할 금액을 입력하세요>");
		 int amount = scanner.nextInt();
		 int result;
		 try {
			 result = account.withdraw(amount);//잔액 >출금액보다 큰 경우
			 System.out.println("출금액:"+result);
		 }catch(Exception e) {//잔액 <출금액보다 작은경우
			 System.out.println(e.getMessage());
		 }
	}//출금 메소드 끝.
	//입금 메소드
	private static void deposit() {
	 if(!isRegistered()) {// if(!isCreated)			
		System.out.println("먼저 계좌등록을 하세요");
		return;//return;-더이상 진행을 하지 않고 메소드 호출한곳으로 되돌아감.
		}
	 //계좌번호 출력
	 accountList();
	 //계좌번호 선택
	 System.out.println("입금할 계좌번호를 선택하세요>");
		//입금
	 Account account;
	 while(true) {
	 String ano = scanner.next();//계좌번호 입력
	 account = findAccount(ano);//입력된 값으로 계좌배열에서 해당하는 계좌정보를 찾아서 리턴받음
	 if(account==null)//해당하는 계좌가 없으면
		 System.out.println("계좌번호를 확인하세요>");
	 else
		 break;//계속 입력받다가 계좌번호가 맞아서 계좌정보를 얻어오면
	 }//반복문을 빠져나감.
	 System.out.print("입금할 금액을 입력하세요>");
	 int amount = scanner.nextInt();
	  account.deposit(amount);//입금 처리
	  System.out.println("예금 성공");
	}
	private static void accountList() {
		if(!isRegistered()) {// if(!isCreated)			
		System.out.println("먼저 계좌등록을 하세요");
		return;//return;-더이상 진행을 하지 않고 메소드 호출한곳으로 되돌아감.
		}
		for(int i=0;i<accountArray.length;i++) {
			if(accountArray[i]!=null) {
			System.out.println(accountArray[i].getAno()+accountArray[i].getOwner()+accountArray[i].getBalance());
			} 
		}
	}//계좌 리스트 메소드 끝.
	private static void createAccount() {
		//Bank-0001, 홍길동, 100000
		//계좌번호 자동발번
String ano 
  = PREFIX+String.format(new DecimalFormat("0000").format(++seq));
System.out.print("소유주명>");
String owner = scanner.next();//소유주 입력
System.out.print("초기입금액>");
int amount = scanner.nextInt();//초기입금액 입력
		for(int i=0;i<accountArray.length;i++) {
			if(accountArray[i]==null) {
				accountArray[i]
						=new Account(ano,owner,amount);
				System.out.println("계좌 등록 성공");
				isCreated=true;
				//isCreated변수는 static이라서 최종값을 가지고있음
				break;
			}
			//반복문 빠져나가기
		}
	}//메소드끝.
	
	//계좌등록 여부 확인
	private static boolean isRegistered() {
		return isCreated;//최종상태값을 리턴
		                 //초기값은 false이고, 계좌를 등록하면 true
	}
	//입력된 계좌번호로 계좌정보 조회
	private static Account findAccount(String ano) {
		Account account=null;
		for(int i =0;i<accountArray.length;i++) {
			if(accountArray[i]!=null) 
				if(accountArray[i].getAno().equals(ano)) {
					//문자열의 내용비교: 문자열1.equals(문자열2)
					account = accountArray[i];
				}
		}
		return account;
	}
}
