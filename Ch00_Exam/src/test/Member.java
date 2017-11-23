package test;

import java.io.Serializable;

public class Member implements Serializable{
	//필드
	public String name;
	public String address;
	public String tel;
	//생성자
	public Member(String name, String address, String tel) {
		this.name = name;
		this.address = address;
		this.tel = tel;
	}
	
	
	
}
