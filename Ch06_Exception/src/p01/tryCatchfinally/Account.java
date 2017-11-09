package p01.tryCatchfinally;
/**[예외처리]
*	소유주: String타입의 필드 - owner
*	계좌번호: String타입의 필드 - ano
*	잔액: long타입의 필드 - balance
**/
public class Account {
	//필드(객체의 고유 속성, 현재의 상태를 저장하는 멤버변수)
	//소유주
	String owner; //초기값 null
	//계좌번호
	String ano; //초기값 null
	//잔액
	long balance; //초기값 0


	//생성자(owner,ano,balance)
	
	public Account() {}
	
	public Account(String owner) {
		super();
		this.owner = owner;
	}
	
	public Account(String owner, String ano) {
		super();
		this.owner = owner;
		this.ano = ano;
	}
	
	Account(String owner, String ano, long balance) {
		this.owner = owner;
		this.ano = ano;
		this.balance = balance;
	}
	//메소드 getter/setter
	public String getOwner() {
		return owner;
	}
	public void setOwner(String owner) {
		this.owner = owner;
	}
	public String getAno() {
		return ano;
	}
	public void setAno(String ano) {
		this.ano = ano;
	}
	public long getBalance() {
		return balance;
	}
	public void setBalance(long balance) {
		this.balance = balance;
	}
	public void deposit(int amount) {
		balance += amount;
	}
	//예외를 강제로 발생시킴: throw new Exception(); →Exception()생성자에 메세지 입력
	//new Exception();생성, throw→예외 위임 메소드
	public int withdraw(int amount) throws Exception {
		if(balance < amount) {
			throw new Exception("잔액이 부족합니다.");
		}else {
			balance -= amount;
		}
		return amount;
	}
}
