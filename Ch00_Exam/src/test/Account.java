package test;

public class Account {
	//필드
	private String ano;//계좌번호
	private String owner;//소유자
	private int balance;//잔고
	//생성자
	public Account(String ano, String owner, int balance) {
		//super();//=> Account extends Object
		this.ano = ano;
		this.owner = owner;
		this.balance = balance;
	}
	//메소드
	protected String getAno() {	return ano;	}
	protected void setAno(String ano) {	this.ano = ano;	}
	protected String getOwner() {		return owner;	}
	protected void setOwner(String owner) {	this.owner = owner;	}
	protected int getBalance() {	return balance;	}
	protected void setBalance(int balance) {this.balance = balance;	}
	public void deposit(int amount) {
		this.balance+=amount;	
	}//입금 메소드
	//출금메소드
	public int withdraw(int amount)throws Exception {//예외 처리를 호출한곳으로 떠넘김
		if(this.balance < amount) {//강제 예외 처리
			throw new Exception("잔액이 모자랍니다.");
			//new Exception():예외객체 생성 
			//throw :생성한 예외 객체를 호출한쪽을 넘김
			//메소드의매개변수옆에 있는 throws Exception은 호출한쪽으로 예외를 넘기는 문장
			// 이 문장이 있으면 호출한 곳에서도 예외 처리를 해줘야함.
		}else {//this.balance>=amount 때,
		this.balance -= amount;//출금처리
		return amount;//출금액을 리턴
	}
 }
}
