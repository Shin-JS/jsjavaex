package p01.classes;

public class Account {
	//속성(field)
	private String owner;
	private int balance;
	//동작(method)
	public String getOwner() { //소유주 리턴
		return owner;
	}

	public void setOwner(String owner) { //소유주 저장
		this.owner = owner;
	}

	public int getBalance() { //잔고출력 메소드
		return balance;
	}

	public void setBalance(int balance) { //초기 입금 메소드
		this.balance = balance;
	}
	
	public void deposit(int amount) { //입금 메소드
		this.balance += amount;
	}
	
	public int withdraw(int amount) { //출금메소드
		if(this.balance < amount) {
			return this.balance; //남아있는 잔고까지만 출금(?) 말이 안됨
//			return 0; //잔고는 그대로, 출금안됨
		}else { //this.balance >=amount
		this.balance -= amount;
		return amount;
		}
	}
	
	public static void main(String[] args) {
		
	}
}
