package p01.tryCatchfinally;
/**[예외처리]
*
**/
public class AccountExample {
	public static void main(String[] args) /*throws Exception 의 방법으로 처리 가능*/ {
		//객체생성
		Account account1 = new Account();
		account1.owner = "도우너";
		account1.ano="111-001";
		account1.balance = 100000;
		account1.setOwner("도우너");
		account1.setAno("111-001");
		account1.setBalance(100000);
		String name = account1.getOwner();
		String ano = account1.getAno();
		long balance = account1.getBalance();
		System.out.println("계좌정보|| "+"이름: "+name + " "+"계좌번호: " + ano + " "+"잔액: " + balance);
		Account account2 = new Account("고길동");
		account2.ano = "111-004";
		account2.balance = 100000;
		account1.setBalance(100000);
		name = account2.getOwner();
		ano = account2.getAno();
		balance = account2.getBalance();
		System.out.println("계좌정보|| "+"이름: "+name + " "+"계좌번호: " + ano + " "+"잔액: " + balance);
		Account account3 = new Account("둘리", "111-002");
		account3.balance = 100000;
		account1.setBalance(100000);
		name = account3.getOwner();
		ano = account3.getAno();
		balance = account3.getBalance();
		System.out.println("계좌정보|| "+"이름: "+name + " "+"계좌번호: " + ano + " "+"잔액: " + balance);
		Account account4 = new Account("마이콜","111-003",100000);
		name = account4.getOwner();
		ano = account4.getAno();
		balance = account4.getBalance();
		System.out.println("계좌정보|| "+"이름: "+name + " "+"계좌번호: " + ano + " "+"잔액: " + balance);
		
		//입금처리
		account4.deposit(50000);//
		long amt = account4.getBalance();//필드의 역할: 고유속성이나 현재상태를 저장
		System.out.println("현재 잔액은 "+amt + "입니다.");
		//출금처리
		//호출되는 메소드가 throws Exception{}으로 선언되어있으면, 호출하는 곳에서 예외처리를 해줘야 함
		//예외처리 방법: try-catch(){}(호출한쪽에서 예외를 처리), throws Exception{}(이 프로그램을 호출한 곳으로 예외를 위임, ex)메인메소드 참고) 의 2가지 방법이 있음
		try {
			account4.withdraw(80000);
			System.out.println(1);
			account4.withdraw(80000); //예외 발생
			System.out.println(2);
		}catch(Exception e) {
			System.out.println(e.getMessage()); //getMessage()가 호출된 메소드의 Exception()의 생성자 매개변수의 메세지를 받아서 처리
		}

	}
}
