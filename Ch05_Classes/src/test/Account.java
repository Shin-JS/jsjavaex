package test;
/** [20171103 과제]
 * 
 **/
public class Account {
	//필드
	private String ano; //계좌번호
	private String owner; //소유자
	private int balance; //잔고
	
	//생성자
	public Account(String ano, String owner, int balance) {
//		super();//크게 의미 없다 왜냐하면, Account extends Object이기 때문에(?)
		this.ano = ano;
		this.owner = owner;
		this.balance = balance;
	}
	
	//메소드
	public String getAno() {
		return ano;
	}
	public void setAno(String ano) {
		this.ano = ano;
	}
	public String getOwner() {
		return owner;
	}
	public void setOwner(String owner) {
		this.owner = owner;
	}
	public int getBalance() {
		return balance;
	}
	public void setBalance(int balance) {
		this.balance = balance;
	}
	
	
}
