package p01.classes;
/****/
public class AccountExample1 {
	public static void main(String[] args) {
		//객체(instance)생성
		Account account;
		account = new Account(); //계좌(Account)instance생성 및 대입
		account.setOwner("고길동"); //setOwner("값") -> name필드에 "값"저장됨
		account.setBalance(10000); //setBalance(값) -> balance필드에 값 저장됨
		
		System.out.println(account.getOwner()+"  "+"잔고: "+account.getBalance());
		//추가입금
		account.deposit(5000); //클래스에 설계된 deposit(){}메소드를 통해 balance필드에 값 저장
		System.out.println(account.getOwner()+"  "+"잔고: "+account.getBalance());
		
		//출금
		account.withdraw(12000); //balance > amount
		System.out.println(account.getOwner()+"  "+"잔고: "+account.getBalance());
		account.withdraw(7000);//balance < amount
		System.out.println(account.getOwner()+"  "+"잔고: "+account.getBalance());
	}
}
